import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Msg } from 'src/chat/entity/msg.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { AssignCurrentMatch } from '../dto/assign-current-match.dto';
import { CreateMatchDto } from '../dto/create-match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { Match, MatchStatus } from '../entity/match.entity';
import { ACCELERATION, BALL_VY, RACKET_HEIGHT, RACKET_THICKNESS } from '../match.constants';

@Injectable()
export class MatchService {
	constructor(
		@InjectRepository(Match)
		private matchsRepository: Repository<Match>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	async findAll(): Promise<Match[]> {
        return this.matchsRepository.find();
    }

    async findOne(id: string): Promise<Match> {
        const match = await this.matchsRepository.findOne(id);
        if (!match)
            throw new NotFoundException(`Match #${id} not found`);
        return match;
    }

    
    async updateMatch(current_username: string, id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
        
        let match = await this.matchsRepository.findOne(id);
        if (!match)
            throw new NotFoundException(`Match #${id} not found`);
        if ((match.user1.username != current_username && match.user2.username != current_username) || updateMatchDto.status < match.status)
            throw new UnauthorizedException();
		match.status = updateMatchDto.status;
		match.score1 = updateMatchDto.score1;
		match.score2 = updateMatchDto.score2;
        return this.matchsRepository.save(match);
    }

    async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
		if (createMatchDto.user1_id == createMatchDto.user2_id)
			throw new BadRequestException("Cannot self match")
		const user1 = await this.usersRepository.findOne(createMatchDto.user1_id)
		if (!user1)
            throw new NotFoundException(`User #${createMatchDto.user1_id} not found`);
		const user2 = await this.usersRepository.findOne(createMatchDto.user2_id)
		if (!user2)
			throw new NotFoundException(`User #${createMatchDto.user2_id} not found`);
		const match = {
			user1: user1,
			user2: user2,
			mode: createMatchDto.mode,
			status: MatchStatus.ACTIVE // to remove, just for test !!!!
		}
        return this.matchsRepository.save(match);
    }

	async updatePositionMatch(match_id: number) {
		const match = await this.matchsRepository.findOne(match_id)
		console.log("update position of ", match.id)
		if (match.sleep > 0) {
			match.sleep -= 1
		}
		else {

			match.bx = match.bx + match.bvx
			match.by = match.by + match.bvy
			if (match.bx < 0)
				this.resetBall(match, "right")
			else if (match.bx > 200)
				this.resetBall(match, "left")
			else if (match.bx < 4 && (match.y1 + 12 > match.bx && match.y1 - 12 < match.bx))
				this.reboundBall(match, "left")
			else if (match.bx > 196 && (match.y2 + 12 > match.bx && match.y2 - 12 < match.bx))
				this.reboundBall(match, "right")
			if (match.by < 0) {
				match.by = - match.by;
				match.bvy = - match.bvy
			}
			else if (match.by > 100) {
				match.by = 100 - match.by;
				match.bvy = - match.bvy
			}
		}
		return this.matchsRepository.save(match)
	}

	private resetBall(match: Match, scoring_side: string): Match {
		match.sleep = 2
		match.bx = 100
		match.by = 50
		match.bvy = 2
		if (scoring_side == "left") {
			match.score1 += 1	
			match.bvx = -2
		}
		else {
			match.score2 += 1
			match.bvx = -2
		}
		return match
	}

	private reboundBall(match: Match, side: string): Match {
		match.bvx = - match.bvx * ACCELERATION
		match.bx = 2 * RACKET_THICKNESS - match.bx
		if (side == "left")
		{
			match.bvy = BALL_VY * (match.by - match.y1) / RACKET_HEIGHT;
		}
		else
		{
			match.bvy = -BALL_VY * (match.by - match.y1) / RACKET_HEIGHT;
		}
		return match
	}

	// async assignCurrentMatch(assignCurrentMatch: AssignCurrentMatch): Promise<Match> {
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


	async updatePositionCurrentMatch(match_id: string, username: string, command:string): Promise<Match> {
		console.log('updating match...')
		if (command != 'up' && command != 'down')
			throw new BadRequestException("Command Unknown")
		const user = await this.usersRepository.findOne({ username });
        if (!user)
            throw new NotFoundException(`User ${username} not found`);
		const currentMatch = await this.matchsRepository.findOne(match_id);
		console.log(currentMatch.id)
		if (!currentMatch)
			throw new NotFoundException("No Current Match")
		if (currentMatch.user1.username == username)
			currentMatch.y1 += (command == 'up') ? 5 : -5;
		else if (currentMatch.user2.username == username)
			currentMatch.y2 += (command == 'up') ? 5 : -5;
		return this.matchsRepository.save(currentMatch);
		
	}

	

}
