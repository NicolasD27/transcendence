import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../entity/channel.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { User } from '../../user/entity/user.entity';
import { Msg } from '../../chat/entity/msg.entity';

@Injectable()
export class ChannelService {

	constructor(
		@InjectRepository(Channel)
		private channelRepo: Repository<Channel>,

		@InjectRepository(Msg)
		private msgRepo: Repository<Msg>,

		@InjectRepository(User)
		private userRepo: Repository<User>,
	) {}

	async create(username: string, createChannelDto: CreateChannelDto) {

		const user = await this.userRepo.findOne({ username });
		const newChannel = await this.channelRepo.create({
			name : createChannelDto.name,
			description: createChannelDto.description,
			owner : user,
		})
		await this.channelRepo.save(newChannel);
		return newChannel;
	}

	async findOne(channelId: number): Promise<Channel> {
		const myChannel = await this.channelRepo.findOne({ where: { id: channelId } });
		if (!myChannel)
			throw new NotFoundException();
		return myChannel;
	}

	async getMessages(channelId: number): Promise<Msg[]> {

		const myChannel = await this.channelRepo.findOne({ where: { id : channelId } });

		if (!myChannel)
			throw new NotFoundException();

		return await this.msgRepo.find({ where: { channel: channelId } });
	}

}
