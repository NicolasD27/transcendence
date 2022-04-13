import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../entity/channel.entity';
import { Repository } from 'typeorm';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { Participation } from '../entity/participation.entity';
import { CreateMsgDto } from 'src/message/dto/create-msg.dto';
import { User } from '../../user/entity/user.entity';
import { Msg } from '../../message/entity/msg.entity';
import { ChannelDto } from '../dto/channel.dto';
import * as bcrypt from 'bcrypt';
import { MsgDto } from 'src/message/dto/message.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UpdateChannelPassword } from '../dto/update-channel-password.dto';


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

	saltRounds = 10;

	async findAll(): Promise<ChannelDto[]>
	{
		return await this.channelRepo.find()
			.then(items => items.map(e=> Channel.toDto(e)));
	}

	async findOne(channelId: string): Promise<ChannelDto>
	{
		const myChannel = await this.channelRepo.findOne(channelId);
		if (!myChannel)
			throw new NotFoundException();
		return Channel.toDto(myChannel);
	}

	async create(username: string, createChannelDto: CreateChannelDto): Promise<ChannelDto>
	{

		console.log("channel.create()");
		console.log(createChannelDto);

		const	user = await this.userRepo.findOne({ username });
		let		hash = "";
		if (createChannelDto.password !== "")
		{
			// todo : using salt could be cool
			const saltRounds = 10;
			hash = await bcrypt.hash(createChannelDto.password, this.saltRounds);
			// console.log(`${createChannelDto.password} -> ${hash}`);
		}
		

		const newChannel = await this.channelRepo.create({
			name : createChannelDto.name,
			description: createChannelDto.description,
			owner : user,
			hashedPassword : hash, 
		});
		await this.channelRepo.save(newChannel);
		this.join(username, newChannel.id.toString(), createChannelDto.password);
		return Channel.toDto(newChannel);
	}

	async join(username: string, channelId: string, notHashedPassword: string)
	{
		const user = await this.userRepo.findOne({ username });
		if (! user)
			throw new NotFoundException("username not found");
		const channel = await this.channelRepo.findOne(channelId);
		if (! channel)
			throw new NotFoundException("channel not found");
		
		if (channel.hashedPassword === "") {
			if (notHashedPassword !== "")
				throw new UnauthorizedException("password not empty");
		}
		else if (! await bcrypt.compare(notHashedPassword, channel.hashedPassword))
			throw new UnauthorizedException("wrong password");

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

	async leave(username: string, channelId: string)
	{
		const user = await this.userRepo.findOne({ username });
		if (! user)
			throw new NotFoundException("username not found");
		const channel = await this.channelRepo.findOne(channelId);
		if (! channel)
			throw new NotFoundException("channel not found");

		const participation = await this.participationRepo.find({
			where: {
				user: user.id,
				channel: channel.id
			}});

		if (! participation.length)
			throw new UnauthorizedException("Channel was not joined");
		
		await this.participationRepo.delete(participation[0].id);

		return true;
	}

	async getChannelUsers(id: string): Promise<UserDto[]>
	{
		const myChannel = await this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException("channel not found");
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
		return users.map(e=> User.toDto(e));
	}

	async getChannelMessages(id: string): Promise<MsgDto[]>
	{
		const myChannel = await this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException(`channel ${id} not found`);

		const msgs = await this.msgRepo.find({ where: { channel: id } })
			.then(items => items.map(e=> Msg.toDto(e)));

		return msgs;
	}

	async checkUserJoinedChannel(username: string, channelId: string) : Promise<boolean>
	{
		const myChannel = await this.channelRepo.findOne(channelId);
		if (!myChannel)
			throw new NotFoundException(`channel ${channelId} not found`);

		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`username ${username} not found`);

		// console.log("//channelID : " + channelId);
		// console.log(channelId);

		// const myParticipations = await this.participationRepo.find({
        //     relations: ['user', 'channel'],
        //     where: [
		// 		{ user: myUser},
		// 		{ channel: myChannel },
        //     ],
        // });

		// const myParticipations = await this.participationRepo.query(
		// 	`SELECT id FROM "participation" WHERE "userId" = ${channelId};`
		// );

		const myParticipations = await this.participationRepo.find({
			where: {
				user: myUser.id,
				channel: myChannel.id,
			}});

		console.log("// myParticipations : ");
		console.log(myParticipations);

		if (myParticipations.length > 0)
			return true;

		return false;
	}

	async updatePassword(id: string, username: string, updateChannelPassword: UpdateChannelPassword)
	{
		const myChannel = await this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException(`channel ${id} not found`);

		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`username ${username} not found`);

		if (myUser.id != myChannel.owner.id)
			throw new UnauthorizedException("you are not owning this channel");

		if (myChannel.hashedPassword === "") {
			if (updateChannelPassword.previousPassword !== "")
				throw new UnauthorizedException("wrong password");
		}
		else if (! await bcrypt.compare(updateChannelPassword.previousPassword, myChannel.hashedPassword))
			throw new UnauthorizedException("wrong password");

		if (updateChannelPassword.newPassword === "") {
			myChannel.hashedPassword = "";
		}
		else
			myChannel.hashedPassword = await bcrypt.hash(updateChannelPassword.newPassword, this.saltRounds);

		await this.channelRepo.save(myChannel);

	}

}
