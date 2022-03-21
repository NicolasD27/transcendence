import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Msg } from 'src/chat/entity/msg.entity';
import { User } from 'src/user/entity/user.entity';
import { UserRepository } from 'src/user/repository/user.repository';
import { Repository } from 'typeorm';

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
	getAllMessages() {
		return this.msgRepo.find();
		// ({ relations: ['content'],});
		// return this.msgRepo.count();
	}

	async getAllQuery()	{
		// return (await this.msgRepo.query("SELECT * FROM msg;"));
		const m = this.msgRepo.findOne({ where: {id: 23} });
		return m;
	}

}
