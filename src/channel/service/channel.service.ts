import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../entity/channel.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { Msg } from 'src/chat/entity/msg.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';

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

	async create(username: string, createChannelDto: CreateChannelDto)
	{
		const user = await this.userRepo.findOne({ username });
		const newChannel = await this.channelRepo.create({
			name : createChannelDto.name,
			description: createChannelDto.description,
			owner : user,
		});
		await this.channelRepo.save(newChannel);
		return newChannel;
	}

	async findAll(): Promise<Channel[]>
	{
		return await this.channelRepo.find();
	}

	async findOne(channelId: string): Promise<Channel>
	{
		const myChannel = await this.channelRepo.findOne(channelId);
		if (!myChannel)
			throw new NotFoundException();
		return myChannel;
	}

	async getChannelUsers(channelId: string)
	{
		const myChannel = await this.channelRepo.findOne(channelId);
		if (!myChannel)
			throw new NotFoundException();
		return await this.userRepo.find({ where: { channels: channelId } });
	}

	async getMessages(id: string)//: Promise<CreateMsgDto[]>
	{
		const myChannel = await this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException();
		return await this.msgRepo.find({ where: { channel: id } });
		// return await this.msgRepo.query('SELECT user, content FROM msg WHERE "channelId" IS NULL;');

	}

}
