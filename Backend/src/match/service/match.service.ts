import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationService } from 'src/notification/service/notification.service';
import { Connection, Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { AssignCurrentMatch } from '../dto/assign-current-match.dto';
import { CreateMatchDto } from '../dto/create-match.dto';
import { MatchDto } from '../dto/match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { Match, MatchStatus } from '../entity/match.entity';
import { MatchRepository } from '../repository/match.repository';
import { NotificationRepository } from '../../notification/repository/notification.repository';
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';
import { activeUsers } from 'src/auth-socket.adapter';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(Match)
		private matchsRepository: Repository<Match>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly notificationService: NotificationService,
	) {}

	async findAll(paginationQuery: PaginationQueryDto): Promise<MatchDto[]> {
        return this.matchsRepository.find({
			where:{
			},
			take: paginationQuery.limit,
			skip: paginationQuery.offset,
			})
			.then(items => items.map(e=> Match.toDto(e, activeUsers)));
    }

	async findAllActive(paginationQuery: PaginationQueryDto): Promise<MatchDto[]> {
        return this.matchsRepository.find({
			where:{
				status: MatchStatus.ACTIVE
			},
			take: paginationQuery.limit,
			skip: paginationQuery.offset,
			})
			.then(items => items.map(e=> Match.toDto(e, activeUsers)));
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
            throw new NotFoundException(`Match #${id} not found`);
		return match.status == MatchStatus.ACTIVE
    }

	async findAllMatchsByUser(id: string,paginationQueryDto: PaginationQueryDto): Promise<MatchDto[]>
    {
        return this.matchsRepository.find({
			where: [
				{ user1: +id },
				{ user2: +id },
			],
			order: { id: "ASC" },
			take: paginationQueryDto.limit,
			skip: paginationQueryDto.offset,
		})
		.then(items => items.map(e=> Match.toDto(e, activeUsers)));
    }

    async updateMatch(current_username: string, id: string, updateMatchDto: UpdateMatchDto): Promise<MatchDto> {

		// console.log(updateMatchDto);
        const match = await this.matchsRepository.preload({
			id: +id,
			...updateMatchDto
		});
        if (!match)
            throw new NotFoundException(`Match #${id} not found`);
        if ((match.user1.username != current_username && match.user2.username != current_username) || updateMatchDto.status < match.status)
            throw new UnauthorizedException();
		await this.notificationService.actionPerformedMatch(match)
        await this.matchsRepository.save(match);
		activeUsers.display();
		console.log("match : ", match);
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
		console.log("match : ", match)
		if (match)
			this.matchsRepository.save(match);
		else
		{
			console.log("creating match...")
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
		if (match && match.user1.id != user.id) {
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

	// async assignCurrentMatch(assignCurrentMatch: AssignCurrentMatch): Promise<MatchDto> {
	// 	if (assignCurrentMatch.user1_id == assignCurrentMatch.user2_id)
	// 		throw new BadRequestException("Cannot self match")
	// 	const user1 = await this.usersRepository.findOne(assignCurrentMatch.user1_id)
	// 	if (!user1)
    //         throw new NotFoundException(`User #${assignCurrentMatch.user1_id} not found`);
	// 	const user2 = await this.usersRepository.findOne(assignCurrentMatch.user2_id)
	// 	if (!user2)
	// 		throw new NotFoundException(`User #${assignCurrentMatch.user2_id} not found`);
	// 	const match = await this.matchsRepository.findOne(assignCurrentMatch.match_id)
	// 	if (!match)
	// 		throw new NotFoundException(`Match #${assignCurrentMatch.match_id} not found`);
	// 	user1.currentMatch = match;
	// 	user2.currentMatch = match;
	// 	// match.user1 = user1;
	// 	// match.user2 = user2;
	// 	await this.usersRepository.save(user1);
	// 	await this.usersRepository.save(user2);
	// 	return this.matchsRepository.save(match);
	// }

}
