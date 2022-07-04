import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationService } from 'src/notification/service/notification.service';
import { Repository, Not, In } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { CreateMatchDto } from '../dto/create-match.dto';
import { MatchDto } from '../dto/match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { Match, MatchStatus } from '../entity/match.entity';
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';
import { activeUsers } from 'src/auth-socket.adapter';
import { FinishedMatchDto } from '../dto/finished-match.dto';
import { UpdateScoreDto } from '../dto/update-score.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { MatchRepository } from '../repository/match.repository';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(Match)
		private matchsRepository: Repository<Match>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly notificationService: NotificationService,
	) { }

	async findAll(paginationQuery: PaginationQueryDto): Promise<MatchDto[]> {
		return this.matchsRepository.find({
			where: {
			},
			take: paginationQuery.limit,
			skip: paginationQuery.offset,
		})
			.then(items => items.map(e => Match.toDto(e, activeUsers)));
	}

	async findAllActive(paginationQuery: PaginationQueryDto): Promise<MatchDto[]> {
		return this.matchsRepository.find({
			where: {
				status: MatchStatus.ACTIVE
			},
			take: paginationQuery.limit,
			skip: paginationQuery.offset,
		})
			.then(items => items.map(e => Match.toDto(e, activeUsers)));
	}

	async findOne(id: string): Promise<MatchDto> {
		const match = await this.matchsRepository.findOne(id);
		if (!match)
			throw new NotFoundException(`Match #${id} not found`);
		return Match.toDto(match, activeUsers);
	}

	async isActive(id: string): Promise<boolean> {
		const match = await this.matchsRepository.findOne(id);
		if (!match)
		{
			//throw new NotFoundException(`Match #${id} not found`);
			console.log(`Match #${id} not found`);
			return null;
		}
		return match.status == MatchStatus.ACTIVE
	}

	async findAllMatchsByUser(id: string, paginationQueryDto: PaginationQueryDto): Promise<MatchDto[]> {
		return this.matchsRepository.find({
			where: [
				{ user1: +id },
				{ user2: +id },
			],
			order: { id: "ASC" },
			take: paginationQueryDto.limit,
			skip: paginationQueryDto.offset,
		})
			.then(items => items.map(e => Match.toDto(e, activeUsers)));
	}

	async check_match_invite_already_sent(user1: UserDto, user2: UserDto)
	{
		const myMatch = await this.matchsRepository.find({
			where: [
				{
					user1: user1,
					user2: user2,
					status: Not(MatchStatus.FINISHED)
				},
				{
					user1: user2,
					user2: user1,
					status: Not(MatchStatus.FINISHED)
				}
			],
		});
		if (!myMatch || !myMatch.length)
			return false;
		return true;
	}

	// ? add a event to avoid infinite matches
	async check_user_in_match(user: UserDto)
	{
		const myMatch = await this.matchsRepository.find({
			where: [
				{
					user1: user,
					status: In([MatchStatus.ACTIVE, MatchStatus.MATCH_MAKING])
				},
				{
					user2: user,
					status: In([MatchStatus.ACTIVE, MatchStatus.MATCH_MAKING])
				}
			],
		});
		if (!myMatch || !myMatch.length)
			return false;
		return true;
	}

	async updateMatch(current_username: string, id: string, updateMatchDto: UpdateMatchDto): Promise<MatchDto> {

		const match = await this.matchsRepository.preload({
			id: +id,
			...updateMatchDto
		});
		if (!match)
			throw new NotFoundException(`Match #${id} not found`);
		if ((match.user1.username != current_username && match.user2.username != current_username))
			throw new UnauthorizedException();
		// await this.notificationService.actionPerformedMatch(match)
		await this.matchsRepository.save(match);
		return Match.toDto(match, activeUsers)
	}

	async updateScore(current_username: string, id: string, updateScoreDto: UpdateScoreDto): Promise<MatchDto> {

		// //console.log(updateScoreDto);
		const match = await this.matchsRepository.preload({
			id: +id,
			...updateScoreDto
		});
		if (!match)
			throw new NotFoundException(`Match #${id} not found`);
		if ((match.user1.username != current_username && match.user2.username != current_username))
			throw new UnauthorizedException();
		await this.matchsRepository.save(match);
		return Match.toDto(match, activeUsers)
	}

	async matchIsFinished(current_username: string, id: string, finishedMatchDto: FinishedMatchDto): Promise<MatchDto> {

		const match = await this.matchsRepository.preload({
			id: +id,
			...finishedMatchDto
		});
		if (!match)
			throw new NotFoundException(`Match #${id} not found`);
		if ((match.user1.username != current_username && match.user2.username != current_username) || finishedMatchDto.status < match.status)
			throw new UnauthorizedException();
		await this.matchsRepository.save(match);
		return Match.toDto(match, activeUsers)
	}

	async acceptChallenge(current_username: string, id: string): Promise<MatchDto> {

		const match = await this.matchsRepository.findOne(id);
		if (!match)
			throw new NotFoundException(`Match #${id} not found`);
		if ((match.user1.username != current_username && match.user2.username != current_username))
			throw new UnauthorizedException();
		match.status = MatchStatus.ACTIVE;
		await this.notificationService.actionPerformedMatch(match)
		await this.matchsRepository.save(match);
		return Match.toDto(match, activeUsers)
	}

	async destroyMatch(current_username: string, id: string): Promise<MatchDto> {

		let match = await this.matchsRepository.findOne(id);
		if (!match)
			throw new NotFoundException(`Match #${id} not found`);
		if ((match.user1.username != current_username && match.user2.username != current_username))
			throw new UnauthorizedException();
		this.notificationService.actionPerformedMatch(match)
		this.matchsRepository.remove(match);
		return Match.toDto(match, activeUsers)
	}

	async createMatch(createMatchDto: CreateMatchDto): Promise<MatchDto> {
		if (createMatchDto.user1_id == createMatchDto.user2_id)
			throw new BadRequestException("Cannot self match")
		const user1 = await this.usersRepository.findOne(createMatchDto.user1_id)
		if (!user1)
			throw new NotFoundException(`User #${createMatchDto.user1_id} not found`);
		const user2 = await this.usersRepository.findOne(createMatchDto.user2_id)
		if (!user2)
			throw new NotFoundException(`User #${createMatchDto.user2_id} not found`);
		let match = await this.matchsRepository.findOne(
			{
				user1: user1,
				user2: user2,
				mode: createMatchDto.mode,
				status: MatchStatus.ACTIVE
			}
		)
		if (match)
			this.matchsRepository.save(match);
		else {
			match = await this.matchsRepository.create({
				user1: user1,
				user2: user2,
				mode: createMatchDto.mode
			});
			match = await this.matchsRepository.save(match)
			await this.notificationService.create(match, match.user2)
		}
		return Match.toDto(match, activeUsers)
	}

	async matchmaking(username: string, mode: number): Promise<Match> {
		const user = await this.usersRepository.findOne({ username })
		if (!user)
			throw new NotFoundException(`User ${username} not found`);
		const match = await this.matchsRepository.findOne(
			{
				mode: mode,
				status: MatchStatus.MATCH_MAKING
			}
		)
		if (match && match.user1.id == user.id) {
			this.destroyMatch(username, match.id.toString())
			return this.matchsRepository.save({
				user1: user,
				mode: mode,
				status: MatchStatus.MATCH_MAKING
			})
		}
		else if (match) {
			match.date = new Date();
			match.status = MatchStatus.ACTIVE
			match.user2 = user;
			return this.matchsRepository.save(match)
		}
		else {
			return this.matchsRepository.save({
				user1: user,
				mode: mode,
				status: MatchStatus.MATCH_MAKING
			})
		}
	}

	@Interval(5000)
	async handleInterval() {
		// console.log("handleInterval")
		let now = new Date();
		
		const ghosts = await this.matchsRepository.find({
			where : {
				// id : 1,
				status: 2,
				score1: 0,
				score2: 0,
			}
		}).then(items => items.map(g =>{
			let diff = Math.abs(
				(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds())
				- (new Date(g.date).getHours() * 3600 + new Date(g.date).getMinutes() * 60 + new Date(g.date).getSeconds())
			);
			// console.log(diff);
			if (diff > 90)
			{
				// console.log("remove match")
				this.matchsRepository.remove(g);
			}
		}));
	}

}
