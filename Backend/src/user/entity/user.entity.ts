import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as bcrypt from "bcrypt"
import { Exclude } from "class-transformer";
import { Friendship } from "../../friendship/entity/friendship.entity";
import { Msg } from "../../chat/entity/msg.entity";
import { Match } from "../../match/entity/match.entity";
import { Channel } from "../../channel/entity/channel.entity";
<<<<<<< HEAD

export enum Status {
=======
import { UserDto } from "../dto/user.dto";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { Participation } from "src/channel/entity/participation.entity";
import { ModerationTimeOut } from "src/channel/entity/moderationTimeOut.entity";
import DatabaseFile from "./database-file.entity";
import { DirectMessage } from "src/direct-message/entity/direct-message.entity";
import { ChannelInvite } from "src/channel/entity/channelInvite.entity";

export enum UserStatus {
>>>>>>> master
	OFFLINE,
	ONLINE,
	SEARCHING,
	PLAYING

}

@Entity()
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: "varchar", nullable: false, unique: true })
	username: string

<<<<<<< HEAD
	// @Column({ type: "varchar" })
	// password: string

	// @Column()
	// salt: string

	// @Column({ nullable: true })
	// @Exclude()
	// public hashedRefreshToken?: string

=======
	@Column({ type: "varchar", nullable: false, unique: true})
	pseudo: string 

	
>>>>>>> master
	@Column({ nullable: true })
	twoFactorAuthSecret?: string

	@Column({ default: false })
	public isTwoFactorEnable: boolean

	@Column({ nullable: true })
	avatar: string

	@Column({ default: Status.ONLINE })
	status: number

	@OneToMany(() => Friendship, friendship => friendship.follower)
	followers: Friendship[];

	@OneToMany(() => Friendship, friendship => friendship.following)
	followings: Friendship[];

	@OneToMany(() => Channel, channel => channel.owner)
	channels: Channel[];

<<<<<<< HEAD
=======
	@OneToMany(() => Participation, participation => participation.user)
	participations: Participation[];

	@OneToMany(() => ModerationTimeOut, moderationTimeOut => moderationTimeOut.user)
	moderationTimeOuts: ModerationTimeOut[];

	@OneToMany(() => ChannelInvite, channelInvite => channelInvite.sender)
	channelInviteSenders: ChannelInvite[];
	@OneToMany(() => ChannelInvite, channelInvite => channelInvite.receiver)
	channelInviteReceivers: ChannelInvite[];

>>>>>>> master
	@OneToMany(() => Msg, msg => msg.user)
	messages: Msg[];

	@OneToMany(() => Match, match => match.user1)
	matchs1: Match[];

	@OneToMany(() => Match, match => match.user2)
	matchs2: Match[];

	// async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
	//	 return await bcrypt.compare(password, hashedPassword).then(result => result)
	// }
}