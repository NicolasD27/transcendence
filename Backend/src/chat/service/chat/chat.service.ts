import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../user/entity/user.entity';
import { Msg } from '../../entity/msg.entity';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Msg)
		private msgRepo: Repository<Msg>,
		@InjectRepository(User)
		private userRepo: Repository<User>,
	) {}

	async saveMsg(content: string, username: string) {

		const user = await this.userRepo.findOne({username});
		const newMsg = await this.msgRepo.create({
			content, user
		})
		await this.msgRepo.save(newMsg);
		return newMsg;
	}

	// async 
	async getAllMessages(): Promise<Msg[]> {
		// return this.msgRepo.find({ relations: ['user'],});
		return this.msgRepo.find();
		// return this.msgRepo.query("SELECT id, content, userId FROM");
	}

	async getFirstQuery()	{
		// return (await this.msgRepo.query("SELECT * FROM msg;"));
		const m = this.msgRepo.findOne({ where: {id: 1} });
		return m;
	}

}
