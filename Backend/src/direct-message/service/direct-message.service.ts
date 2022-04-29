import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

	async saveMsg(content: string, receiverUsername: string, username: string) : Promise<DirectMessageDto> {

		const sender = await this.userRepo.findOne({username});
		const receiver = await this.userRepo.findOne({username: receiverUsername});
		const newMsg = await this.directMessageRepository.create({
			content, sender, receiver
		})
		await this.directMessageRepository.save(newMsg);
		return DirectMessage.toDto(newMsg);
	}

	// async 
	async getAllMessages(): Promise<DirectMessageDto[]> {
		// return this.directMessageRepository.find({ relations: ['user'],});
		return this.directMessageRepository.find()
			.then(items => items.map(e=> DirectMessage.toDto(e)));;
		// return this.directMessageRepository.query("SELECT id, content, userId FROM");
	}

	async getFirstQuery()	{
		// return (await this.directMessageRepository.query("SELECT * FROM msg;"));
		const m = this.directMessageRepository.findOne({ where: {id: 1} });
		return m;
	}

}
