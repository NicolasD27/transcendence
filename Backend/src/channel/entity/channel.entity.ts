import { UserDto } from "src/user/dto/user.dto";
import { ActiveUsers } from "src/user/entity/active-user";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Msg } from "../../message/entity/msg.entity";
import { User } from "../../user/entity/user.entity";
import { ChannelDtoWithModeration } from "../dto/channel-with-moderation.dto";
import { ChannelDto } from "../dto/channel.dto";
import { ChannelInvite } from "./channelInvite.entity";
import { ModerationTimeOut } from "./moderationTimeOut.entity";
import { Participation } from "./participation.entity";

@Entity()
export class Channel extends BaseEntity
{
	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ default: false })
	public isPrivate: boolean;

	@Column({ default: false })
	public isProtected: boolean;

	@Column({ unique: true })
	public name: string;

	@Column()
	hashedPassword: string;

	@ManyToOne(() => User, user => user.channels, { eager: true })
	owner: User;

	@OneToMany(() => Msg, msg => msg.channel)
	messages: Msg[];

	@OneToMany(() => Participation, participation => participation.channel)
	participations: Participation[];

	@OneToMany(() => ModerationTimeOut, moderationTimeOut => moderationTimeOut.channel)
	moderationTimeOuts: ModerationTimeOut[];

	@OneToMany(() => ChannelInvite, channelInvite => channelInvite.channel)
	channelInvites: ChannelInvite[];

	static toDto(channel: Channel, _activeUsers: ActiveUsers) : ChannelDto
	{
		const dto: ChannelDto = {
			id: channel.id,
			isPrivate: channel.isPrivate,
			isProtected: channel.isProtected,
            name: channel.name,
            owner: User.toDto(channel.owner, _activeUsers),
		}
		return dto;
	}

	static toDtoWithModeration(
		channel: Channel,
		modos: UserDto[],
		restricted: any[],
		_activeUsers: ActiveUsers,
	) : ChannelDtoWithModeration
	{
		const dto: ChannelDtoWithModeration = {
			id: channel.id,
			isPrivate: channel.isPrivate,
			isProtected: channel.isProtected,
            name: channel.name,
            owner: User.toDto(channel.owner, _activeUsers),
			moderators: modos,
			restricted: restricted,
		}
		return dto;
	}

}