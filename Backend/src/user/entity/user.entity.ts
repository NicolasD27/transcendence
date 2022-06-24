import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Friendship } from "../../friendship/entity/friendship.entity";
import { Msg } from "../../message/entity/msg.entity";
import { Match } from "../../match/entity/match.entity";
import { Channel } from "../../channel/entity/channel.entity";
import { UserDto } from "../dto/user.dto";
import { Participation } from "src/channel/entity/participation.entity";
import { ModerationTimeOut } from "src/channel/entity/moderationTimeOut.entity";
import DatabaseFile from "./database-file.entity";
import { DirectMessage } from "src/direct-message/entity/direct-message.entity";
import { Notification } from "src/notification/entity/notification.entity";
import { ChannelInvite } from "src/channel/entity/channelInvite.entity";
import { activeUsers } from "src/auth-socket.adapter";
import { UserStatus } from "../utils/user-status";

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: "varchar", nullable: false, unique: true })
	username: string

	@Column({ type: "varchar", nullable: false, unique: true})
	pseudo: string


	@Column({ nullable: true })
	twoFactorAuthSecret?: string

	@Column({ default: false })
	public isTwoFactorEnable: boolean

	@JoinColumn({ name: 'avatarId' })
	@OneToOne(
		() => DatabaseFile,
		{
		nullable: true
		}
	)
	public avatar?: DatabaseFile;

	@Column({ nullable: true })
	public avatarId?: number;

	@Column({ default: UserStatus.ONLINE })
	status: number

	@OneToMany(() => Friendship, friendship => friendship.follower)
	followers: Friendship[];

	@OneToMany(() => Friendship, friendship => friendship.following)
	followings: Friendship[];

	@OneToMany(() => Channel, channel => channel.owner)
	channels: Channel[];

	@OneToMany(() => Participation, participation => participation.user)
	participations: Participation[];

	@OneToMany(() => ModerationTimeOut, moderationTimeOut => moderationTimeOut.user)
	moderationTimeOuts: ModerationTimeOut[];

	@OneToMany(() => ChannelInvite, channelInvite => channelInvite.sender)
	channelInviteSenders: ChannelInvite[];
	@OneToMany(() => ChannelInvite, channelInvite => channelInvite.receiver)
	channelInviteReceivers: ChannelInvite[];

	@OneToMany(() => Msg, msg => msg.user)
	messages: Msg[];

	@OneToMany(() => DirectMessage, directMessage => directMessage.sender)
	directMessagesSent: DirectMessage[];

	@OneToMany(() => DirectMessage, directMessage => directMessage.receiver)
	directMessagesReceived: DirectMessage[];

	@OneToMany(() => Match, match => match.user1)
	matchs1: Match[];

	@OneToMany(() => Match, match => match.user2)
	matchs2: Match[];

	@OneToMany(() => Notification, notification => notification.receiver)
	notifications: Notification[];

	static toDto(user: User) {
		// return plainToInstance(UserDto, instanceToPlain(user), { excludeExtraneousValues: true })
		const dto: UserDto = {
			id : user.id,
			username: user.username,
			pseudo: user.pseudo,
			avatarId: user.avatarId,
			status: activeUsers.getUserStatus(user.id),
			isTwoFactorEnable: user.isTwoFactorEnable
		};
		return dto;
	}

}