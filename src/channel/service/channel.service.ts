import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../entity/channel.entity';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { Msg } from 'src/chat/entity/msg.entity';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { Participation } from '../entity/participation.entity';
import { throws } from 'assert';
import { CreateMsgDto } from 'src/chat/dto/create-msg.dto';

@Injectable()
export class ChannelService {

	constructor(
		@InjectRepository(Channel)
		private channelRepo: Repository<Channel>,

		@InjectRepository(Participation)
		private participationRepo: Repository<Participation>,

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
		this.join(username, newChannel.id.toString());
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

	async join(username: string, channelId: string)
	{
		const user = await this.userRepo.findOne({ username });
		if (!user)
			throw new NotFoundException("username not found");
		const channel = await this.channelRepo.findOne(channelId);
		if (!channel)
			throw new NotFoundException("channel not found");

		const participation = await this.participationRepo.find({
			where: {
				user: user.id,
				channel: channel.id
			}});

		console.log(participation);

		if (participation.length)
			throw new UnauthorizedException("Channel already joined");

		const newParticipation = await this.participationRepo.create({
			user: user,
			channel: channel
		});

		await this.participationRepo.save(newParticipation);

		return newParticipation; 
	}

	async getChannelUsers(id: string): Promise<User[]>
	{
		const myChannel = await this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException();
		const myParticipations = await this.participationRepo.find({
            relations: ['user'],
            where: [
                { channel: myChannel },
            ],
        });
		const users = [];
		myParticipations.forEach((participation) => {
			users.push(participation.user)
		})
		return users;
	}

	async getChannelMessages(id: string): Promise<CreateMsgDto[]>
	{
		const myChannel = await this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException();

		const msg = await this.msgRepo.find({ where: { channel: id } });

		const arrayMsgDto: CreateMsgDto[] = [];
		msg.forEach((message) => {
			arrayMsgDto.push({
				content: message.content,
				author: message.id
			});
		})
		// return await this.msgRepo.query('SELECT user, content FROM msg WHERE "channelId" IS NULL;');

		return arrayMsgDto;
	}

}
