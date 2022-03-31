import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/channel/entity/channel.entity';
import { Msg } from 'src/chat/entity/msg.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Msg)
		private msgRepo: Repository<Msg>,
		@InjectRepository(User)
		private userRepo: Repository<User>,
		@InjectRepository(Channel)
		private channelRepo: Repository<Channel>
	) {}

	async saveMsg(content: string, channelId: string, username: string) {

		const user = await this.userRepo.findOne({username});
		const channel = await this.channelRepo.findOne(channelId);
		const newMsg = await this.msgRepo.create({
			content, channel, user
		})
		await this.msgRepo.save(newMsg);
		return newMsg;
	}

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
