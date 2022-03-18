import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Msg } from 'src/chat/entity/msg.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Msg)
		private msgRepo: Repository<Msg>,
	) {}

	async saveMsg(content: string, author: number) {
		const newMsg = await this.msgRepo.create({
			content, author
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
