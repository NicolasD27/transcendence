import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Msg } from "../../chat/entity/msg.entity";
import { User } from "../../user/entity/user.entity";
<<<<<<< HEAD
=======
import { ChannelDto } from "../dto/channel.dto";
import { ChannelInvite } from "./channelInvite.entity";
import { ModerationTimeOut } from "./moderationTimeOut.entity";
import { Participation } from "./participation.entity";
>>>>>>> master

@Entity()
export class Channel extends BaseEntity {

	@PrimaryGeneratedColumn()
	public id: number;

<<<<<<< HEAD
	@Column()
=======
	@Column({ default: false })
	public isPrivate: boolean;

	@Column({ unique: true })
>>>>>>> master
	public name: string;

	@Column()
	public description: string;

	@ManyToOne(() => User, user => user.channels, { eager: true })
	owner: User;

	@OneToMany(() => Msg, msg => msg.channel)
	messages: Msg[];

<<<<<<< HEAD
	// @Column()
	// password: string;	// needs to be hashed with salt grains
=======
	@OneToMany(() => Participation, participation => participation.channel)
	participations: Participation[];

	@OneToMany(() => ModerationTimeOut, moderationTimeOut => moderationTimeOut.channel)
	moderationTimeOuts: ModerationTimeOut[];

	@OneToMany(() => ChannelInvite, channelInvite => channelInvite.channel)
	channelInvites: ChannelInvite[];

	static toDto(channel: Channel) {
		const dto: ChannelDto = {
			id: channel.id,
            name: channel.name,
            owner: User.toDto(channel.owner),
            description: channel.description
		}
		return dto;
	}
>>>>>>> master

	// @Column()
	// public privacy: number;
}