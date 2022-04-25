import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../entity/channel.entity';
import { getConnection, Repository } from 'typeorm';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { Participation } from '../entity/participation.entity';
import { User } from '../../user/entity/user.entity';
import { Msg } from '../../message/entity/msg.entity';
import { ChannelDto } from '../dto/channel.dto';
import * as bcrypt from 'bcrypt';
import { MsgDto } from 'src/message/dto/message.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { UpdateChannelPassword } from '../dto/update-channel-password.dto';
import { BanUserFromChannelDto } from '../dto/ban-user-from-channel.dto';
import { DeleteChannelDto } from '../dto/delete-channel.dto';
import { ChangeChannelOwnerDto } from '../dto/change-owner.dto';
import { BannedState, ModerationTimeOut } from '../entity/moderationTimeOut.entity';

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

		@InjectRepository(ModerationTimeOut)
		private moderationTimeOutRepo: Repository<ModerationTimeOut>,
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

		const	channelExist = await this.channelRepo.findOne({
			where: {
				name: createChannelDto.name,
			}
		})
		if (channelExist)
			throw new UnauthorizedException("This channel name is already taken.");	// 

		// let		hash = "";
		// if (createChannelDto.password !== "")	//* this check might be pointless
		// {
			const hash = await bcrypt.hash(createChannelDto.password, this.saltRounds);
			// console.log(`${createChannelDto.password} -> ${hash}`);
		// }

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
		
		// if (channel.hashedPassword === "") {
		// 	if (notHashedPassword !== "")
		// 		throw new UnauthorizedException("password not empty");
		// }
		// else 
		if (! await bcrypt.compare(notHashedPassword, channel.hashedPassword))
			throw new UnauthorizedException("wrong password");

		const participation = await this.participationRepo.find({
			where: {
				user: user.id,
				channel: channel.id,
			}
		});

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

		const participation = await this.participationRepo.findOne({
			where: {
				user: user.id,
				channel: channel.id
			}});

		if (! participation)
			throw new UnauthorizedException("Channel was not joined");
		
		if (channel.owner.id == user.id)
			throw new UnauthorizedException(
				"The owner of a channel can't leave without passing the ownership to another user in the channel.");
		
		await this.participationRepo.delete(participation.id);

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

	async checkUserJoinedChannel(username: string, channelId: string) // : Promise<boolean>
	{
		const myChannel = await this.channelRepo.findOne(channelId);
		if (!myChannel)
			throw new NotFoundException(`channel ${channelId} not found`);

		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`username ${username} not found`);

		const myParticipation = await this.participationRepo.findOne({
			where: {
				user: myUser,
				channel: myChannel,
			}
		});
		console.log(myParticipation);
		if (!myParticipation)
			throw new NotFoundException(`Channel not joined`);

		const tos = await this.moderationTimeOutRepo.find({
			where: {
				user: myUser,
				channel: myChannel,
				bannedState: 2,
			}
		});
		// todo : it is awful, I need to do something
		console.log(tos);
		const _now = new Date();
		tos.forEach(element => {
			if (element.date > _now)
				throw new NotFoundException(`You are banned from this channel until ${element.date}`);
		});

		return true;
	}

	async updatePassword(id: string, username: string, updateChannelPassword: UpdateChannelPassword)
	{
		const myChannel = await this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException(`channel #${id} not found`);

		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`username #${username} not found`);

		if (myUser.id != myChannel.owner.id)
			throw new UnauthorizedException("you are not owning this channel");

		if (! await bcrypt.compare(updateChannelPassword.previousPassword, myChannel.hashedPassword))
			throw new UnauthorizedException("wrong password");

		myChannel.hashedPassword = await bcrypt.hash(updateChannelPassword.newPassword, this.saltRounds);

		await this.channelRepo.save(myChannel);
	}

	// todo : finish this using another entity
	async changeBanStatus(id: string, username: string, banUserFromChannelDto: BanUserFromChannelDto, newBanStatus: number)
	{
		const banhammer = await this.userRepo.findOne({ username });
		if (! banhammer)	//! add this if there is no guard
			throw new NotFoundException(`username ${username} not found.`);
		
		const myChannel = await this.channelRepo.findOne(id);
		if (! myChannel)
			throw new NotFoundException(`Channel #${id} not found.`);

		const participation = await this.participationRepo.findOne({
			where: {
				user: banhammer.id,
				channel: myChannel.id,
			}
		});
		if (! participation)
			throw new UnauthorizedException("Channel is not joined.");

		// console.log("// participation : ");
		// console.log(participation);

		if (! participation.isModo)
			throw new UnauthorizedException("You need to be moderator to mute/ban people on a channel.");

		// console.log("// banUserFromChannelDto :");
		// console.log(banUserFromChannelDto);

		const futureBanned = await this.userRepo.findOne({ where: { id: banUserFromChannelDto.userId.toString() } });
		if (! futureBanned)
			throw new NotFoundException(`userId #${banUserFromChannelDto.userId} not found.`);

		// console.log("// futureBanned : ");
		// console.log(futureBanned);

		// todo : make a super user to avoid moderation problems ?
		if (myChannel.owner.id == futureBanned.id)
			throw new UnauthorizedException("The Owner of the channel can't be banned.");

		const futureBannedParticipation = await this.participationRepo.findOne({
			where: {
				user: banUserFromChannelDto.userId,
				channel: myChannel.id,
			}
		});
		if (! futureBannedParticipation)
			throw new UnauthorizedException("This user is not in this channel.");
		if (futureBannedParticipation.isModo)
			throw new UnauthorizedException("A Moderator can not be banned or muted.");

		const previousBans = await this.moderationTimeOutRepo.find({
			where: {
				user: futureBanned,
				channel: myChannel,
			}
		});

		// ? ban an user already banned will set it's previous ban to stop now,
		// ? then apply the new ban TO

		let _now:Date = new Date();
		previousBans.forEach((ban) => {
			if (ban.date > _now)	//  && ban.bannedState == newBanStatus
			{
				ban.date = _now;
				this.moderationTimeOutRepo.save(ban);
				// if (newBanStatus == 1)
				// 	throw new UnauthorizedException("User already muted.");
				// else
				// 	throw new UnauthorizedException("User already banned.");
			}
		});

		let myTimeout = new Date();
		myTimeout.setSeconds(myTimeout.getSeconds() + banUserFromChannelDto.timeout);
		console.log("// should be timed out until " + myTimeout);

		const myModerationTO = await this.moderationTimeOutRepo.create({
			channel: myChannel,
			user: futureBanned,
			bannedState: newBanStatus,
			date: myTimeout,
		});
		await this.moderationTimeOutRepo.save(myModerationTO);

	}

	async changeOwner(id:string, username:string, changeChannelOwnerDto:ChangeChannelOwnerDto)
	{
		const myUser = await this.userRepo.findOne({ username });

		const myChannel = await this.channelRepo.findOne(id);
		if (! myChannel)
			throw new NotFoundException(`Channel #${id} not found.`);

		if (myChannel.owner.id != myUser.id)
			throw new UnauthorizedException("Only the owner of a channel can pass it's ownership.");

		const newOwner = await this.userRepo.findOne({ where: { id: changeChannelOwnerDto.userId, } });
		if (! newOwner)
			throw new NotFoundException(`username #${changeChannelOwnerDto.userId} not found.`);

		// todo: use a promise for this. error code 206 could be returned with a message.
		if (changeChannelOwnerDto.userId == myUser.id)
			return ;
			// throw new UnauthorizedException("You already are the owner of this channel.");

		const newOwnerParticipation = await this.participationRepo.findOne({
			where: {
				user: newOwner.id,
				channel: myChannel,
			}
		});
		if (!newOwnerParticipation)
			throw new UnauthorizedException("This user have not joined the channel");

		console.log("// changeChannelOwnerDto.password : " + changeChannelOwnerDto.password);
		if (! await bcrypt.compare(changeChannelOwnerDto.password, myChannel.hashedPassword))
			throw new UnauthorizedException("wrong password");

		myChannel.owner = newOwner;
		this.channelRepo.save(myChannel);

		return (true);
	}

	async remove(id:string, username:string, deleteChannelDto:DeleteChannelDto)
	{
		const myUser = await this.userRepo.findOne({ username });

		const myChannel = await this.channelRepo.findOne(id);
		if (! myChannel)
			throw new NotFoundException(`Channel #${id} not found.`);

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

		if (! await bcrypt.compare(deleteChannelDto.password, myChannel.hashedPassword))
			throw new UnauthorizedException("wrong password");

		// //? delete every participations to this channel
		// await getConnection()
		// 	.createQueryBuilder()
		// 	.delete()
		// 	.from("participation")
		// 	.where("channel = :channelId", { channelId: myChannel.id})
		// 	.execute();
		// //? delete every messages of this channel
		// await getConnection()
		// 	.createQueryBuilder()
		// 	.delete()
		// 	.from("msg")
		// 	.where("channelId = :id", { id: myChannel.id})
		// 	.execute();
		// //? delete every moderation feed of this channel
		// await getConnection()
		// 	.createQueryBuilder()
		// 	.delete()
		// 	.from("moderation_time_out")
		// 	.where("channelId = :id", { channelId: myChannel.id})
		// 	.execute();
		//? delete the channel in CASCADE
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from("channel")
			.where("id = :channelId", { channelId: myChannel.id})
			.execute();

		// todo: maybe close the room for active users
		// todo: send users a ping ?
	}
}
