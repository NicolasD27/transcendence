import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Msg } from 'src/chat/entity/msg.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { CreateMatchDto } from '../dto/create-match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { Match } from '../entity/match.entity';

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
        
        const match = await this.matchsRepository.preload({
            id: +id,
            ...updateMatchDto
        })
        if (!match)
            throw new NotFoundException(`Match #${id} not found`);
        if (match.user1.username != current_username && match.user2.username != current_username)
            throw new UnauthorizedException();
        return this.matchsRepository.save(match);
    }

    //just for dev
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
			mode: createMatchDto.mode
		}
        return this.matchsRepository.save(match);
    }


	async updatePositionCurrentMatch(username: string, command:string): Promise<Match> {
		if (command != 'up' && command != 'down')
			throw new BadRequestException("Command Unknown")
		const user = await this.usersRepository.findOne({ username });
        if (!user)
            throw new NotFoundException(`User ${username} not found`);
		if (!user.currentMatch)
		throw new NotFoundException("No Current Match")
		const currentMatch = user.currentMatch;
		if (currentMatch.user1.username == username)
			currentMatch.y1 += (command == 'up') ? 5 : -5;
		else if (currentMatch.user2.username == username)
			currentMatch.y2 += (command == 'up') ? 5 : -5;
		return this.matchsRepository.save(currentMatch);
		
	}

	

}
