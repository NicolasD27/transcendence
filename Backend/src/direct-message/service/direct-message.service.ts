import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { activeUsers } from 'src/auth-socket.adapter';
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';
import { Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { DirectMessageDto } from '../dto/direct-message.dto';
import { DirectMessage } from '../entity/direct-message.entity';

@Injectable()
export class DirectMessageService {
	constructor(
		@InjectRepository(DirectMessage)
		private directMessageRepository: Repository<DirectMessage>,
		@InjectRepository(User)
		private userRepo: Repository<User>,
	) {}

	async getDirectMessagesFrom(
		id: string,
		username: string,
		paginationQuery: PaginationQueryDto
	): Promise<DirectMessageDto[]>
	{
		const myUser = await this.userRepo.findOne({username})
		if (!myUser)
			throw new NotFoundException(`user ${username} not found`);
		const user = await this.userRepo.findOne(id);
		if (!user)
			throw new NotFoundException(`user ${id} not found`);
		const { limit, offset } = paginationQuery;
		console.log("pagination query ***********************:", limit, offset)
		const msgs = await this.directMessageRepository.find({
			where: [
				{
					sender: user,
					receiver: myUser 
				},
				{
					receiver: user,
					sender: myUser
				}
			],
			take: limit,
			skip: offset,
			})
			.then(items => items.map(e=> DirectMessage.toDto(e, activeUsers)));

		return msgs;
	}

	async saveMsg(content: string, receiverUsername: string, username: string) : Promise<DirectMessageDto> {

		const sender = await this.userRepo.findOne({username});
		const receiver = await this.userRepo.findOne({username: receiverUsername});
		const newMsg = await this.directMessageRepository.create({
			content, sender, receiver
		})
		await this.directMessageRepository.save(newMsg);
		return DirectMessage.toDto(newMsg, activeUsers);
	}

	// async 
	async getAllMessages(): Promise<DirectMessageDto[]> {
		// return this.directMessageRepository.find({ relations: ['user'],});
		return this.directMessageRepository.find()
			.then(items => items.map(e=> DirectMessage.toDto(e, activeUsers)));;
		// return this.directMessageRepository.query("SELECT id, content, userId FROM");
	}

	async getFirstQuery()	{
		// return (await this.directMessageRepository.query("SELECT * FROM msg;"));
		const m = this.directMessageRepository.findOne({ where: {id: 1} });
		return m;
	}

}
