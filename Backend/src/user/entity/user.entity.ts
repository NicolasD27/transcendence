import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Friendship } from "../../friendship/entity/friendship.entity";
import { Msg } from "../../message/entity/msg.entity";
import { Match } from "../../match/entity/match.entity";
import { Channel } from "../../channel/entity/channel.entity";
import { UserDto } from "../dto/user.dto";
import { instanceToPlain, plainToInstance } from "class-transformer";
import { Participation } from "src/channel/entity/participation.entity";
import DatabaseFile from "./database-file.entity";

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

	@OneToMany(() => Msg, msg => msg.user)
	messages: Msg[];
	
	@OneToMany(() => Match, match => match.user1)
	matchs1: Match[];

	@OneToMany(() => Match, match => match.user2)
	matchs2: Match[];

	static toDto(user: User) {
		return plainToInstance(UserDto, instanceToPlain(user), { excludeExtraneousValues: true })
	}
	// @Column({ type: "varchar" })
	// password: string
	
	// @Column()
	// salt: string
	
	// @Column({ nullable: true })
	// @Exclude()
	// public hashedRefreshToken?: string

	// async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
	//	 return await bcrypt.compare(password, hashedPassword).then(result => result)
	// }

}