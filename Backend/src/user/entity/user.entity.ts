import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Friendship } from "../../friendship/entity/friendship.entity";
import { Msg } from "../../chat/entity/msg.entity";
import { Match } from "../../match/entity/match.entity";
import { Channel } from "../../channel/entity/channel.entity";
import { UserDto } from "../dto/user.dto";
import { instanceToPlain, plainToInstance } from "class-transformer";

export enum UserStatus {
	OFFLINE,
	ONLINE,
	SEARCHING,
	PLAYING

}

@Entity()
@Unique(['username'])

export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: "varchar" })
	username: string

	@Column({ nullable: true })
	twoFactorAuthSecret?: string

	@Column({ default: false })
	public isTwoFactorEnable: boolean

	@Column({ nullable: true })
	avatar: string

	@Column({ default: UserStatus.ONLINE })
	status: number

	@OneToMany(() => Friendship, friendship => friendship.follower)
	followers: Friendship[];

	@OneToMany(() => Friendship, friendship => friendship.following)
	followings: Friendship[];

	@OneToMany(() => Channel, channel => channel.owner)
	channels: Channel[];

	@OneToMany(() => Msg, msg => msg.user)
	messages: Msg[];

	@OneToMany(() => Match, match => match.user1)
	matchs1: Match[];

	@OneToMany(() => Match, match => match.user2)
	matchs2: Match[];

	static toDto(user: User) {
		return plainToInstance(UserDto, instanceToPlain(user), { excludeExtraneousValues: true })
	}
}