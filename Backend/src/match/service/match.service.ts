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
import { ACCELERATION, BALL_VY, RACKET_HEIGHT, RACKET_THICKNESS, GAME_LENGTH, GAME_HEIGHT, GAME_SLEEP, BALL_VX, BALL_RADIUS, RACKET_MOV } from '../match.constants';
import { MatchRepository } from '../repository/match.repository';
import { NotificationRepository } from '../../notification/repository/notification.repository';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(Match)
		private matchsRepository: Repository<Match>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly notificationService: NotificationService,
		private notificationsRepository: NotificationRepository,
		private connection: Connection
		
	) {
		// matchsRepository = this.connection.getCustomRepository(MatchRepository)

	}

	async findAll(): Promise<MatchDto[]> {
        return this.matchsRepository.find()
			.then(items => items.map(e=> Match.toDto(e)));
    }

    async findOne(id: string): Promise<MatchDto> {
        const match = await this.matchsRepository.findOne(id);
        if (!match)
            throw new NotFoundException(`Match #${id} not found`);
        return Match.toDto(match);
    }

	async findAllMatchsByUser(id: string): Promise<MatchDto[]>
    {
        return this.matchsRepository.find({ 
		where: [
			{ user1: +id },
			{ user2: +id },
		]})
		.then(items => items.map(e=> Match.toDto(e)));
    }

    
    async updateMatch(current_username: string, id: string, updateMatchDto: UpdateMatchDto): Promise<MatchDto> {
        
        const match = await this.matchsRepository.preload({
			id: +id,
			...updateMatchDto
		});
		console.log(current_username, match)
        if (!match)
            throw new NotFoundException(`Match #${id} not found`);
        if ((match.user1.username != current_username && match.user2.username != current_username) || updateMatchDto.status < match.status)
            throw new UnauthorizedException();
		await this.notificationService.actionPerformedMatch(match)
        this.matchsRepository.save(match);
		return Match.toDto(match)
    }

	async destroyMatch(current_username: string, id: string): Promise<MatchDto> {
        
        let match = await this.matchsRepository.findOne(id);
        if (!match)
            throw new NotFoundException(`Match #${id} not found`);
        if ((match.user1.username != current_username && match.user2.username != current_username))
            throw new UnauthorizedException();
		this.notificationService.actionPerformedMatch(match)
        this.matchsRepository.remove(match);
		return Match.toDto(match)
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
		return Match.toDto(match)
    }

	async matchmaking(username: string, mode: number): Promise<Match> {
		const user = await this.usersRepository.findOne({ username })
		if (!user)
            throw new NotFoundException(`User ${username} not found`);
		let match = await this.matchsRepository.findOne(
			{
				mode: mode,
				status: MatchStatus.MATCH_MAKING
			}
		)
		if (match) {
			match.status = MatchStatus.ACTIVE
			match.user2 = user;
			return this.matchsRepository.save(match)
		}
		else {
			// match = await this.matchsRepository.create({
			// 	user1: user,
			// 	mode: mode,
			// 	status: MatchStatus.MATCH_MAKING
			// })
			// match = await this.matchsRepository.save(match)
		}
	}

	// async updatePositionMatch(match_id: number) {
	// 	const match = await this.matchsRepository.findOne(match_id)
	// 	console.log("update position of ", match.id)
	// 	if (match.sleep > 0) {
	// 		match.sleep -= 1
	// 	}
	// 	else {

	// 		match.bx = match.bx + match.bvx
	// 		match.by = match.by + match.bvy
	// 		if (match.bx <= RACKET_THICKNESS && (match.y1 + RACKET_HEIGHT > match.by && match.y1 < match.by))
	// 			this.reboundBall(match, "left")
	// 		else if (match.bx + BALL_RADIUS >= GAME_LENGTH - RACKET_THICKNESS && (match.y2 + RACKET_HEIGHT > match.by && match.y2 < match.by))
	// 			this.reboundBall(match, "right")
	// 		else if (match.bx < 0)
	// 			this.resetBall(match, "right")
	// 		else if (match.bx + BALL_RADIUS >= GAME_LENGTH)
	// 			this.resetBall(match, "left")
	// 		if (match.by <= 0) {
	// 			if (match.by != 0)
	// 				match.by = 0; 
	// 			match.bvy = - match.bvy
	// 		}
	// 		else if (match.by >= GAME_HEIGHT) {
	// 			if (match.by > GAME_HEIGHT)
	// 				match.by = GAME_HEIGHT;
	// 			match.bvy = - match.bvy
	// 		}
	// 	}
	// 	return this.matchsRepository.save(match)
	// }

	// private resetBall(match: Match, scoring_side: string): Match {
	// 	match.sleep = GAME_SLEEP
	// 	match.bx = GAME_LENGTH / 2
	// 	match.by = GAME_HEIGHT / 2
	// 	match.bvy = BALL_VY
	// 	if (scoring_side == "left") {
	// 		match.score1 += 1	
	// 		match.bvx = -BALL_VX
	// 	}
	// 	else {
	// 		match.score2 += 1
	// 		match.bvx = -BALL_VX
	// 	}
	// 	return match
	// }

	// private reboundBall(match: Match, side: string): Match {
	// 	match.bvx = - match.bvx * ACCELERATION
	// 	if (match.bx <= RACKET_THICKNESS)
	// 		match.bx = RACKET_THICKNESS
	// 		// match.bx = 2 * RACKET_THICKNESS - match.bx
	// 	else if (match.bx + BALL_RADIUS >= GAME_LENGTH - RACKET_THICKNESS)
	// 		match.bx = GAME_LENGTH - RACKET_THICKNESS - BALL_RADIUS
	// 		// match.bx = 2 * GAME_LENGTH + RACKET_THICKNESS - match.bx - BALL_RADIUS
	// 	if (side == "left")
	// 	{
	// 		match.bvy = BALL_VY * ((match.by - match.y1) * 2  - RACKET_HEIGHT) / RACKET_HEIGHT;
	// 	}
	// 	else
	// 	{
	// 		match.bvy = BALL_VY * ((match.by - match.y2) * 2 - RACKET_HEIGHT) / RACKET_HEIGHT;
	// 	}
	// 	return match
	// }

	// // async assignCurrentMatch(assignCurrentMatch: AssignCurrentMatch): Promise<MatchDto> {
	// // 	if (assignCurrentMatch.user1_id == assignCurrentMatch.user2_id)
	// // 		throw new BadRequestException("Cannot self match")
	// // 	const user1 = await this.usersRepository.findOne(assignCurrentMatch.user1_id)
	// // 	if (!user1)
    // //         throw new NotFoundException(`User #${assignCurrentMatch.user1_id} not found`);
	// // 	const user2 = await this.usersRepository.findOne(assignCurrentMatch.user2_id)
	// // 	if (!user2)
	// // 		throw new NotFoundException(`User #${assignCurrentMatch.user2_id} not found`);
	// // 	const match = await this.matchsRepository.findOne(assignCurrentMatch.match_id)
	// // 	if (!match)
	// // 		throw new NotFoundException(`Match #${assignCurrentMatch.match_id} not found`);
	// // 	user1.currentMatch = match;
	// // 	user2.currentMatch = match;
	// // 	// match.user1 = user1;
	// // 	// match.user2 = user2;
	// // 	await this.usersRepository.save(user1);
	// // 	await this.usersRepository.save(user2);
	// // 	return this.matchsRepository.save(match);
	// // }


	// async updatePositionCurrentMatch(match_id: string, username: string, command:string): Promise<Match> {
	// 	console.log('updating match...')
	// 	if (command != 'up' && command != 'down')
	// 		throw new BadRequestException("Command Unknown")
	// 	const user = await this.usersRepository.findOne({ username });
    //     if (!user)
    //         throw new NotFoundException(`User ${username} not found`);
	// 	const currentMatch = await this.matchsRepository.findOne(match_id);
	// 	console.log(currentMatch.id)
	// 	if (!currentMatch)
	// 		throw new NotFoundException("No Current Match")
	// 	// if (currentMatch.user1.username == username)
	// 	// {
	// 		if (command == 'up' && currentMatch.y1 < 50 - RACKET_HEIGHT)
	// 			currentMatch.y1 += RACKET_MOV;
	// 		else if (command == 'down' && currentMatch.y1 > 0)
	// 			currentMatch.y1 -= RACKET_MOV;
	// 	// }
			
	// 	// else if (currentMatch.user2.username == username)
	// 	// {
	// 		if (command == 'up' && currentMatch.y2 < 50 - RACKET_HEIGHT)
	// 			currentMatch.y2 += RACKET_MOV;
	// 		else if (command == 'down' && currentMatch.y2 > 0)
	// 			currentMatch.y2 -= RACKET_MOV;
	// 	// }
	// 	return this.matchsRepository.save(currentMatch);
		
	// }

	

}
