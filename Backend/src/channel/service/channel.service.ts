import { Injectable,
	NotFoundException,
	UnauthorizedException,
	BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../entity/channel.entity';
import { getConnection, Repository, MoreThan, ILike } from 'typeorm';
import { CreateChannelDto } from '../dto/create-channel.dto';
import { Participation } from '../entity/participation.entity';
import { User } from '../../user/entity/user.entity';
import { Msg } from '../../message/entity/msg.entity';
import { ChannelDto } from '../dto/channel.dto';
import * as bcrypt from 'bcrypt';
import { MsgDto } from 'src/message/dto/message.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { BanUserFromChannelDto } from '../dto/ban-user-from-channel.dto';
import { DeleteChannelDto } from '../dto/delete-channel.dto';
import { ChangeChannelOwnerDto } from '../dto/change-owner.dto';
import { ModerationTimeOut } from '../entity/moderationTimeOut.entity';
import { ChannelInvite } from '../entity/channelInvite.entity';
import { CreateChannelInviteDto } from '../dto/create-channel-invite.dto';
import { ChannelInviteDto } from '../dto/channel-invite.dto';
import { Friendship, FriendshipStatus } from 'src/friendship/entity/friendship.entity';
import { NotificationService } from '../../notification/service/notification.service';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { ChannelDtoWithModeration } from '../dto/channel-with-moderation.dto';
import { UpdateChannelDto } from '../dto/update-channel-visibility.dto';
import { number } from 'joi';
import { activeUsers } from 'src/auth-socket.adapter';

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

		@InjectRepository(ChannelInvite)
		private channelInviteRepo: Repository<ChannelInvite>,

		@InjectRepository(Friendship)
		private friendshipRepo: Repository<Friendship>,

		private notificationService: NotificationService
	) { }

	private saltRounds = 12;

	async findAll(
		paginationQuery: PaginationQueryDto
	): Promise<ChannelDto[]> {
		const { limit, offset } = paginationQuery;
		return await this.channelRepo.find({
			where: {
				isPrivate: false,
			},
			order: { name: "ASC" },
			take: limit,
			skip: offset,
		})
			.then(items => items.map(e => Channel.toDto(e, activeUsers)));
	}

	async findOneById(userId: number)
	{
		try {
			return await this.channelRepo.findOne({
				where: { id : userId }
			});
		}
		catch(e) {
			throw new NotFoundException("Channel not found");
		}
		return null;
	}

	async searchForChannel(
		paginationQuery: PaginationQueryDto,
		search?: string,
	): Promise<ChannelDto[]> {
		const { limit, offset } = paginationQuery;
		return await this.channelRepo.find({
			where: {
				isPrivate: false,
				name: ILike(`${search}%`),
			},
			order: { name: "ASC" },
			take: limit,
			skip: offset,
		})
			.then(items => items.map(e => Channel.toDto(e, activeUsers)));
	}

	async getJoinedChannels(username: string): Promise<ChannelDto[]> {
		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)	// ? useless because of the guard
			throw new NotFoundException(`username ${username} not found`);
		// const myUser = await this.userRepo.findOne(1);
		const myParticipations = await this.participationRepo.find({
			where: { user: myUser },
		});

		let myChannels: ChannelDtoWithModeration[] = [];
		for (let i: number = 0; i < myParticipations.length; ++i) {
			// ? getting moderators
			const moderatorsParticipation = await this.participationRepo.find({
				where: {
					channel: myParticipations[i].channel,
					isModo: true,
				},
			});
			const channelModerators = [];
			for (let j: number = 0; j < moderatorsParticipation.length; ++j)
				channelModerators.push(moderatorsParticipation[j].user)

			// ? getting restricted users
			const _now = new Date();
			const tos = await this.moderationTimeOutRepo.find({
				where: {
					channel: myParticipations[i].channel,
					date: MoreThan(_now),
				}
			});
			let restricted = [];
			for (let j: number = 0; j < tos.length; ++j) {
				restricted.push(User.toDto(tos[j].user, activeUsers));
				restricted[j].bannedState = { type: tos[j].bannedState, until: tos[j].date };
			}

			// ? pushing the channel with moderation data
			myChannels.push(Channel.toDtoWithModeration(
				myParticipations[i].channel,
				channelModerators.map(e => User.toDto(e, activeUsers)),
				restricted,
				activeUsers,
			));
		}
		return myChannels;
	}

	async findOneNotPrivate(channelId: number): Promise<ChannelDto> {
		const myChannel = await this.channelRepo.findOne(channelId);
		if (!myChannel || myChannel.isPrivate)
			throw new NotFoundException();
		return Channel.toDto(myChannel, activeUsers);
	}

	async findOneWithModeration(username: string, id: number) {
		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`Username ${username} not found`);

		const myChannel = await this.findOneById(id);
		console.log(myChannel)
		if (!myChannel)
			throw new NotFoundException(`Channel #${id} not found`);

		const myParticipation = await this.participationRepo.findOne({
			where: {
				user: myUser,
				channel: myChannel
			},
		});
		if (!myParticipation)
			return Channel.toDtoWithModeration(myChannel, [], [], activeUsers);

		// ? getting moderators
		const moderatorsParticipation = await this.participationRepo.find({
			where: {
				channel: myChannel,
				isModo: true,
			},
		});
		const channelModerators = [];
		for (let i: number = 0; i < moderatorsParticipation.length; ++i)
			channelModerators.push(moderatorsParticipation[i].user);

		// ? getting restricted users

		const _now = new Date();
		const tos = await this.moderationTimeOutRepo.find({
			where: {
				channel: myChannel,
				date: MoreThan(_now),
			}
		});
		let restricted = [];
		for (let j: number = 0; j < tos.length; ++j) {
			restricted.push(User.toDto(tos[j].user, activeUsers));
			restricted[j].bannedState = { type: tos[j].bannedState, until: tos[j].date };
		}
		return Channel.toDtoWithModeration(
			myChannel,
			channelModerators.map(e => User.toDto(e, activeUsers)),
			restricted,
			activeUsers
		);
	}

	async findOneWS(channelId: number) {
		return await this.channelRepo.findOne(channelId);
	}

	async create(username: string, createChannelDto: CreateChannelDto): Promise<ChannelDto> {
		let hash;
		let myPassword = " ";

		const user = await this.userRepo.findOne({ username });
		if (!user)
			throw new UnauthorizedException();
		const channelExist = await this.channelRepo.findOne({
			where: {
				name: createChannelDto.name,
			}
		})
		if (channelExist)
			throw new UnauthorizedException("This channel name is already taken.");
		if (createChannelDto.isProtected && !createChannelDto.password)					// todo : test it
			throw new UnauthorizedException("You need to fill the 'possword' field");
		if (createChannelDto.isProtected)
			myPassword = createChannelDto.password;

		hash = await bcrypt.hash(myPassword, this.saltRounds);

		const newChannel = await this.channelRepo.create({
			name: createChannelDto.name,
			isPrivate: createChannelDto.isPrivate,
			isProtected: createChannelDto.isProtected,
			owner: user,
			hashedPassword: hash,
		});
		await this.channelRepo.save(newChannel);

		//? the new owner will automaticaly join it's new channel
		const newParticipation = await this.participationRepo.create({
			user: user,
			channel: newChannel,
			isModo: true,
		});
		await this.participationRepo.save(newParticipation);

		return Channel.toDto(newChannel, activeUsers);
	}

	async join(username: string, channelId: string, notHashedPassword: string) {
		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException("Username not found");
		const myChannel = await this.findOneById(+channelId);//await this.channelRepo.findOne(channelId);
		if (!myChannel)
			throw new NotFoundException("Channel not found");
		if (myChannel.isPrivate)
			throw new UnauthorizedException("Private channels can not be joined. You need an invitation.");
		if (myChannel.isProtected) {
			if (!notHashedPassword)
				throw new UnauthorizedException("Channel password is missing");
			if (!await bcrypt.compare(notHashedPassword, myChannel.hashedPassword))
				throw new UnauthorizedException("Wrong password");
		}
		const participations = await this.participationRepo.find({
			where: {
				user: myUser.id,
				channel: myChannel.id,
			}
		});
		if (participations.length)
			throw new UnauthorizedException("Channel already joined");
		// ? give back moderation rights if this user is the owner
		const b_isOwner = (myChannel.owner.id === myUser.id);
		const newParticipation = await this.participationRepo.create({
			user: myUser,
			channel: myChannel,
			isModo: b_isOwner,
		});
		await this.participationRepo.save(newParticipation);

		return newParticipation;
	}

	async leave(username: string, channelId: string) {
		const user = await this.userRepo.findOne({ username });
		if (!user)
			throw new NotFoundException("username not found");
		const channel = await this.findOneById(+channelId); //this.channelRepo.findOne(channelId);
		if (!channel)
			throw new NotFoundException("channel not found");

		const participation = await this.participationRepo.findOne({
			where: {
				user: user.id,
				channel: channel.id
			}
		});
		if (!participation)
			throw new UnauthorizedException("Channel was not joined");

		// if (channel.owner.id == user.id)
		// 	throw new UnauthorizedException(
		// 		"The owner of a channel can't leave without passing the ownership to another user in the channel.");

		await this.participationRepo.delete(participation.id);

		return true;
	}

	async getChannelUsers(id: string, paginationQuery: PaginationQueryDto): Promise<UserDto[]> {
		const { limit, offset } = paginationQuery;
		const myChannel = await this.findOneById(+id);//this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException("channel not found");
		const myParticipations = await this.participationRepo.find({
			// relations: ['user'],
			where: {
				channel: myChannel
			},
			take: limit,
			skip: offset,
		});
		const users = [];
		myParticipations.forEach((participation) => {
			users.push(participation.user)
		})
		return users.map(e => User.toDto(e, activeUsers));
	}

	async getChannelMessages(
		id: string,
		paginationQuery: PaginationQueryDto
	): Promise<MsgDto[]> {
		const myChannel = await this.findOneById(+id);//this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException(`channel ${id} not found`);
		const { limit, offset } = paginationQuery;
		const msgs = await this.msgRepo.find({
			where: {
				channel: id
			},
			take: limit,
			skip: offset,
		})
			.then(items => items.map(e => Msg.toDto(e, activeUsers)));

		return msgs;
	}

	// ? Invites

	async saveInvite(
		username: string,
		// channelId: number,
		createChannelInviteDto: CreateChannelInviteDto
	): Promise<ChannelInviteDto> {
		const myChannel = await this.findOneById(createChannelInviteDto.channelId);//this.channelRepo.findOne(createChannelInviteDto.channelId.toString());
		if (!myChannel)
			throw new NotFoundException();
		const mySender = await this.userRepo.findOne({ username });
		const myParticipation = await this.participationRepo.find({
			where: {
				user: mySender.id,
				channel: createChannelInviteDto.channelId,
			}
		});
		if (!myParticipation)
			throw new UnauthorizedException("You have not joined this channel.");
		const myReceiver = await this.userRepo.findOne({ where: { id: createChannelInviteDto.userId } });
		if (!myReceiver)
			throw new NotFoundException();
		//? check the black list of the receiver to avoid spam
		const blacklisted = await this.friendshipRepo.find({
			where: [
				{
					status: FriendshipStatus.BLOCKED_BY_FOLLOWER,
					following: mySender
				},
				{
					status: FriendshipStatus.BLOCKED_BY_FOLLOWING,
					follower: mySender
				}
			]
		});
		if (blacklisted.length)
			throw new UnauthorizedException("You or this user is blacklisted.");

		const previousInvite = await this.channelInviteRepo.findOne({
			where: {
				sender: mySender.id,
				receiver: myReceiver.id,
			}
		});
		if (previousInvite) // -> limit to one sender for a receiver
			throw new UnauthorizedException("An Invitation is aleady waiting to be accepted.");

		const newInvite = await this.channelInviteRepo.create({
			channel: myChannel,
			sender: mySender,
			receiver: myReceiver,
		});
		const myinvite = await this.channelInviteRepo.save(newInvite);
		await this.notificationService.create(newInvite, newInvite.receiver)
		return ChannelInvite.toDto(myinvite, activeUsers);
	}

	async getChannelInvites(username: string, userId: number, paginationQueryDto: PaginationQueryDto) {
		//console.log("getChannelInvites");
		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`username ${username} not found`);
		if (myUser.id != userId)
			throw new UnauthorizedException("You can't look at someone else's Invitations");
		const invites = await this.channelInviteRepo.find({
			where: {
				receiver: myUser.id,
			},
			take: paginationQueryDto.limit,
			skip: paginationQueryDto.offset
		})
			.then(inv => inv.map(e => ChannelInvite.toDto(e, activeUsers)));
		return (invites);
	}

	async acceptChannelInvite(
		username: string,
		userId: number,
		inviteId: number
	) {
		//console.log('accepting invite...')
		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`username ${username} not found`);
		if (myUser.id != userId)
			throw new UnauthorizedException();

		const myInvite = await this.channelInviteRepo.findOne({
			where: {
				id: inviteId,
			}
		});
		if (!myInvite)
			throw new NotFoundException(`Invitation ${inviteId} not found`);
		if (myInvite.receiver.id != myUser.id)
			throw new UnauthorizedException();

		const myChannel = await this.findOneById(myInvite.channel.id); //this.channelRepo.findOne({ where: { id: myInvite.channel.id } });
		if (!myChannel) {
			await this.channelInviteRepo.delete(myInvite.id);
			throw new UnauthorizedException("The Channel doesn't exist anymore");	// in case removing a channel in CASCADE is not fast enough
		}

		const previousParticipation = await this.participationRepo.findOne({ where: { user: myUser.id, channel: myChannel.id } });
		if (previousParticipation) {
			await this.channelInviteRepo.delete(myInvite.id);
			throw new UnauthorizedException("Channel already joined");
		}

		const b_isOwner = (myChannel.owner.id === myUser.id);
		const newParticipation = await this.participationRepo.create({
			user: myUser,
			channel: myChannel,
			isModo: b_isOwner,
		});
		await this.participationRepo.save(newParticipation);

		// delete invite
		await this.channelInviteRepo.delete(myInvite.id);
	}

	async removeInvitation(
		username: string,
		userId: number,
		inviteId: number
	) {
		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`username ${username} not found`);
		if (myUser.id != userId)
			throw new UnauthorizedException();

		const myInvite = await this.channelInviteRepo.findOne({
			where: {
				id: inviteId,
			}
		});
		if (!myInvite)
			throw new UnauthorizedException();
		if (myInvite.receiver.id != myUser.id)
			throw new UnauthorizedException();
		await this.channelInviteRepo.delete(myInvite.id);
	}

	// ? moderation

	async checkUserRestricted(username: string, channelId: string) {
		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`username ${username} not found`);

		const myChannel = await this.findOneById(+channelId);//this.channelRepo.findOne({ where: { id: channelId } });
		if (!myChannel)
			throw new NotFoundException(`channel ${channelId} not found`);

		//console.log("user and channel found");
		const _now = new Date();
		const tos = await this.moderationTimeOutRepo.find({
			where: {
				channel: myChannel,
				user: myUser,
				date: MoreThan(_now),
			}
		});
		//console.log(_now);
		//console.log(tos);
		if (tos.length > 0)
			throw new UnauthorizedException("User is Restricted on this channel");
		return false;
	}

	async checkUserJoinedChannel(username: string, channelId: string) // : Promise<boolean>
	{
		const myChannel = await this.findOneById(+channelId); //this.channelRepo.findOne(channelId);
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
		//console.log(myParticipation);
		if (!myParticipation)
			throw new UnauthorizedException(`Channel not joined`);

		const tos = await this.moderationTimeOutRepo.find({
			where: {
				user: myUser,
				channel: myChannel,
				bannedState: 2,
			}
		});
		const _now = new Date();
		tos.forEach(element => {
			if (element.date > _now)
				throw new UnauthorizedException(`You are banned from this channel until ${element.date}`);
		});

		return true;
	}

	async checkUserJoinedChannelWS(username: string, channelId: string): Promise<boolean> {
		return new Promise((resolve, rejects) => {
			const myChannel = this.channelRepo.findOne(channelId)
				.catch(() => {
					//console.log("catch 1")
					rejects(false);
				})
				.then(() => {
					const myUser = this.userRepo.findOne({ username })
						.catch(() => {
							//console.log("catch 2")
							rejects(false);
						})
						.then(() => {
							const myParticipation = this.participationRepo.findOne({
								where: {
									user: myUser,
									channel: myChannel,
								}
							})
								.catch(() => {
									//console.log("catch 3")
									rejects(false);
								})
								.then(() => {
									const _now = new Date();
									const activeTOs = this.moderationTimeOutRepo.find({
										where: {
											user: myUser,
											channel: myChannel,
											bannedState: 2,
											date: MoreThan(_now),
										}
									})
										.catch(() => {
											//console.log("checkUserJoinedChannelWS resolve true");
											resolve(true);
										})
										.then(() => {
											//console.log(activeTOs);
											//console.log("checkUserJoinedChannelWS rejects false");
											rejects(false);
										});
								});
						});
				});
		});
	}

	async updateChannelProtection(id: string, username: string, updateChannelDto: UpdateChannelDto) {
		const myChannel = await this.findOneById(+id); //this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException(`Channel #${id} not found`);

		const myUser = await this.userRepo.findOne({ username });
		if (!myUser)
			throw new NotFoundException(`Username ${username} not found`);

		if (myUser.id != myChannel.owner.id)
			throw new UnauthorizedException("You are not owning this channel");
		if (myChannel.isPrivate)
			throw new UnauthorizedException("A private channel can't be public so you can't add/modify/remove a password.");
		if (myChannel.isProtected)
			if (! await bcrypt.compare(updateChannelDto.previousPassword, myChannel.hashedPassword))
				throw new UnauthorizedException("Wrong password");

		if (updateChannelDto.isProtected == true) {
			if (!myChannel.isProtected) {
				myChannel.isProtected = true;
			}
			myChannel.hashedPassword = await bcrypt.hash(updateChannelDto.newPassword, this.saltRounds);
			await this.channelRepo.save(myChannel);
			//console.log(myChannel)
		}
		else {
			if (myChannel.isProtected == true) {
				myChannel.isProtected = false;
				await this.channelRepo.save(myChannel);
			}
		}
	}

	async changeBanStatus(
		id: string,
		username: string,
		banUserFromChannelDto: BanUserFromChannelDto,
		newBanStatus: number) {
		const banhammer = await this.userRepo.findOne({ username });

		const myChannel = await this.findOneById(+id); //this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException(`Channel #${id} not found.`);

		const participation = await this.participationRepo.findOne({
			where: {
				user: banhammer.id,
				channel: myChannel.id,
			}
		});
		if (!participation)
			throw new UnauthorizedException("Channel is not joined.");
		if (!participation.isModo)
			throw new UnauthorizedException("You need to be moderator to mute/ban people on a channel.");

		const futureBanned = await this.userRepo.findOne({ where: { id: banUserFromChannelDto.userId.toString() } });
		if (!futureBanned)
			throw new NotFoundException(`userId #${banUserFromChannelDto.userId} not found.`);

		// todo : make a super user to avoid moderation problems ?
		if (myChannel.owner.id == futureBanned.id)
			throw new UnauthorizedException("The Owner of the channel can't be banned.");

		const futureBannedParticipation = await this.participationRepo.findOne({
			where: {
				user: banUserFromChannelDto.userId,
				channel: myChannel.id,
			}
		});
		if (!futureBannedParticipation)
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

		let _now: Date = new Date();
		previousBans.forEach((ban) => {
			if (ban.date > _now)	// && ban.bannedState == newBanStatus
			{
				ban.date = _now;
				this.moderationTimeOutRepo.save(ban);
			}
		});

		let myTimeout = new Date();
		myTimeout.setSeconds(myTimeout.getSeconds() + Number(banUserFromChannelDto.timeout));
		//console.log("// should be restricted until " + myTimeout);

		const myModerationTO = await this.moderationTimeOutRepo.create({
			channel: myChannel,
			user: futureBanned,
			bannedState: newBanStatus,
			date: myTimeout,
		});
		await this.moderationTimeOutRepo.save(myModerationTO);

		return futureBanned;
	}

	async revertBanStatus(id: string, username: string, futureUnBannedID: string) {
		const banhammer = await this.userRepo.findOne({ username });

		const myChannel = await this.findOneById(+id); //this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException(`Channel #${id} not found.`);

		const participation = await this.participationRepo.findOne({
			where: {
				user: banhammer.id,
				channel: myChannel.id,
			}
		});
		if (!participation)
			throw new UnauthorizedException("Channel is not joined.");
		if (!participation.isModo)
			throw new UnauthorizedException("You need to be moderator to mute/ban people on a channel.");
		const futureUnBanned = await this.userRepo.findOne({ where: { id: futureUnBannedID } });
		if (!futureUnBanned)
			throw new NotFoundException(`userId #${futureUnBannedID} not found.`);

		// todo : make a super user to avoid moderation problems ?
		if (myChannel.owner.id == futureUnBanned.id)
			throw new UnauthorizedException("The Owner of the channel can't be banned, muted or unbanned.");

		const futureUnBannedParticipation = await this.participationRepo.findOne({
			where: {
				user: futureUnBannedID,
				channel: myChannel.id,
			}
		});
		if (!futureUnBannedParticipation)
			throw new UnauthorizedException("This user is not in this channel.");
		if (futureUnBannedParticipation.isModo)
			throw new UnauthorizedException("A Moderator can not be banned or muted or unbanned.");

		const previousBans = await this.moderationTimeOutRepo.find({
			where: {
				user: futureUnBanned,
				channel: myChannel,
			}
		});

		let activeBanFound = 0;
		let _now: Date = new Date();
		previousBans.forEach((ban) => {
			if (ban.date > _now) {
				ban.date = _now;
				this.moderationTimeOutRepo.save(ban);
				activeBanFound -= -1;
			}
		});
		if (!activeBanFound)
			throw new NotFoundException("This user is not banned/muted");

		return (futureUnBanned);
	}

	async giveModerationRights(channelID: string, username: string, futureModoID: string, isGiven: boolean) {
		const myOwner = await this.userRepo.findOne({ username });

		const myChannel = await this.findOneById(+channelID); //this.channelRepo.findOne({ where: { id: channelID } });
		if (!myChannel)
			throw new NotFoundException(`Channel #${channelID} not found.`);
		if (myChannel.owner.id != myOwner.id)
			throw new UnauthorizedException("Only the owner of a channel can give/decline Moderation rights.");

		const newModo = await this.userRepo.findOne({ where: { id: futureModoID, } });
		if (!newModo)
			throw new NotFoundException(`username #${futureModoID} not found.`);
		if (futureModoID === myOwner.id.toString())
			throw new UnauthorizedException("You are the owner of this channel.");

		const newModoParticipation = await this.participationRepo.findOne({
			where: {
				user: newModo.id,
				channel: myChannel,
			}
		});
		if (!newModoParticipation)
			throw new UnauthorizedException("This user have not joined the channel");

		if (newModoParticipation.isModo == isGiven) {
			if (isGiven)
				throw new UnauthorizedException("This user is already moderator");
			else
				throw new UnauthorizedException("This user is not a moderator");
		}
		newModoParticipation.isModo = isGiven;
		await this.participationRepo.save(newModoParticipation);

		return (true);
	}

	async changeOwner(id: string, username: string, changeChannelOwnerDto: ChangeChannelOwnerDto) {
		const myUser = await this.userRepo.findOne({ username });

		const myChannel = await this.findOneById(+id); //this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException(`Channel #${id} not found.`);
		if (myChannel.owner.id != myUser.id)
			throw new UnauthorizedException("Only the owner of a channel can pass it's ownership.");

		const newOwner = await this.userRepo.findOne({ where: { id: changeChannelOwnerDto.userId, } });
		if (!newOwner)
			throw new NotFoundException(`username #${changeChannelOwnerDto.userId} not found.`);
		if (changeChannelOwnerDto.userId == myUser.id)
			throw new UnauthorizedException("You already are the owner of this channel.");

		const newOwnerParticipation = await this.participationRepo.findOne({
			where: {
				user: newOwner.id,
				channel: myChannel,
			}
		});
		if (!newOwnerParticipation)
			throw new UnauthorizedException("This user have not joined the channel");

		if (myChannel.isProtected)
			if (changeChannelOwnerDto.password
				&& ! await bcrypt.compare(changeChannelOwnerDto.password, myChannel.hashedPassword))
				throw new UnauthorizedException("wrong password");

		myChannel.owner = newOwner;
		await this.channelRepo.save(myChannel);

		return (true);
	}

	async remove(id: string, username: string) {
		const myUser = await this.userRepo.findOne({ username });

		const myChannel = await this.findOneById(+id); //this.channelRepo.findOne(id);
		if (!myChannel)
			throw new NotFoundException(`Channel #${id} not found.`);

		const participation = await this.participationRepo.findOne({
			where: {
				user: myUser.id,
				channel: myChannel.id,
			}
		});
		if (!participation)
			throw new UnauthorizedException("Channel was not joined.");
		if (myChannel.owner.id != myUser.id)
			throw new UnauthorizedException("Only the owner of a channel can delete it.");

		// ? this checks the password but private channels aren't supposed to have passwords
		// if (! await bcrypt.compare(deleteChannelDto.password, myChannel.hashedPassword))
		// 	throw new UnauthorizedException("wrong password");

		//? delete the channel in CASCADE
		await getConnection()
			.createQueryBuilder()
			.delete()
			.from("channel")
			.where("id = :channelId", { channelId: myChannel.id })
			.execute();

		// todo: maybe close the room for active users
		// todo: send users a ping ?
	}
}
