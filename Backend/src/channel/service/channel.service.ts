import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../entity/channel.entity';
import { getConnection, Repository } from 'typeorm';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { BannedState, Participation } from '../entity/participation.entity';
import { CreateMsgDto } from 'src/message/dto/create-msg.dto';
import { User } from '../../user/entity/user.entity';
import { Msg } from '../../message/entity/msg.entity';
import { ChannelDto } from '../dto/channel.dto';
import * as bcrypt from 'bcrypt';
import { MsgDto } from 'src/message/dto/message.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UpdateChannelPassword } from '../dto/update-channel-password.dto';
import { BanUserFromChannelDto } from '../dto/ban-user-from-channel.dto';
import { networkInterfaces } from 'os';
import { DeleteChannelDto } from '../dto/delete-channel.dto';


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

	saltRounds = 12;

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
		if (createChannelDto.password !== "")	//* this check might be pointless
		{
			hash = await bcrypt.hash(createChannelDto.password, this.saltRounds);
			// console.log(`${createChannelDto.password} -> ${hash}`);
		}

		//? registering the new channel in the bdd
		const newChannel = await this.channelRepo.create({
			name : createChannelDto.name,
			description: createChannelDto.description,
			owner : user,
			hashedPassword : hash, 
		});
		await this.channelRepo.save(newChannel);
		
		//? the new owner will automaticaly join it's new channel
		const newParticipation = await this.participationRepo.create({
			user: user,
			channel: newChannel,
			isModo: true,
		});
		await this.participationRepo.save(newParticipation);
		
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
				channel: channel.id,
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

		const myParticipations = await this.participationRepo.find({
			where: {
				user: myUser.id,
				channel: myChannel.id,
			}
		});

		// console.log("// myParticipations : ");
		// console.log(myParticipations);

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

	async changeBanStatus(id: string, username: string, banUserDto: BanUserFromChannelDto, banStatus: keyof typeof BannedState)
	{
		const banhammer = await this.userRepo.findOne({ username });
		if (! banhammer)
			throw new NotFoundException(`username ${username} not found.`);
		
		const myChannel = await this.channelRepo.findOne(id);
		if (! myChannel)
			throw new NotFoundException(`Channel ${id} not found.`);

		const participation = await this.participationRepo.findOne({
			where: {
				user: banhammer.id,
				channel: myChannel.id,
			}});

		if (! participation)
			throw new UnauthorizedException("Channel was not joined.");

		console.log("// participation : ");
		console.log(participation);

		if (! participation.isModo)
			throw new UnauthorizedException("You need to be moderator to mute/ban people on a channel.");
		
		let _now = new Date();

		console.log(`new date : ${_now}`);

		// if (banUserDto.date < 

	}

	async remove(id:string, username:string, deleteChannelDto:DeleteChannelDto)
	{
		const myUser = await this.userRepo.findOne({ username });

		const myChannel = await this.channelRepo.findOne(id);
		if (! myChannel)
			throw new NotFoundException(`Channel ${id} not found.`);

		const participation = await this.participationRepo.findOne({
			where: {
				user: myUser.id,
				channel: myChannel.id,
			}
		});

		if (! participation)
			throw new UnauthorizedException("Channel was not joined.");
			
		if (myChannel.owner.id != myUser.id)
			throw new UnauthorizedException("Only the owner of a channel can delete it.");

		const everyParticipations = await this.participationRepo.find({
			where: {
				channel: myChannel.id,
			}
		});
	
		// everyParticipations.forEach(() => {

			// })
		// this.participationRepo.delete({everyParticipations});

		//? delete every participations to this channel
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from("participation")
			.where("channel = :channelId", { channelId: myChannel.id})
			.execute();

		//? delete every messages of this channel
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from("msg")
			.where("channelId = :id", { id: myChannel.id})
			.execute();

		//? delete the channel
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from("channel")
			.where("id = :channelId", { channelId: myChannel.id})
			.execute();

	}
}
