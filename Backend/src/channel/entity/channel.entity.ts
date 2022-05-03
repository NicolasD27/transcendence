import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Msg } from "../../message/entity/msg.entity";
import { User } from "../../user/entity/user.entity";
import { ChannelDto } from "../dto/channel.dto";
import { ModerationTimeOut } from "./moderationTimeOut.entity";
import { Participation } from "./participation.entity";

@Entity()
export class Channel extends BaseEntity {

	@PrimaryGeneratedColumn()
	public id: number;

	@Column({ default: false })
	public isPrivate: boolean;

	@Column({ unique: true })
	public name: string;

	@Column()
	public description: string;

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

	static toDto(channel: Channel) {
		const dto: ChannelDto = {
			id: channel.id,
            name: channel.name,
            owner: User.toDto(channel.owner),
            description: channel.description
		}
		return dto;
	}

}