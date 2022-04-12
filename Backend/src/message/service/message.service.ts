import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from 'src/channel/entity/channel.entity';
import { Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { MsgDto } from '../dto/message.dto';
import { Msg } from '../entity/msg.entity';

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
		return Msg.toDto(newMsg);
	}

	// async 
	async getAllMessages(): Promise<MsgDto[]> {
		// return this.msgRepo.find({ relations: ['user'],});
		return this.msgRepo.find()
			.then(items => items.map(e=> Msg.toDto(e)));;
		// return this.msgRepo.query("SELECT id, content, userId FROM");
	}

	async getFirstQuery()	{
		// return (await this.msgRepo.query("SELECT * FROM msg;"));
		const m = this.msgRepo.findOne({ where: {id: 1} });
		return m;
	}

}
