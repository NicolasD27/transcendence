import { instanceToPlain, plainToInstance } from "class-transformer";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Msg } from "../../message/entity/msg.entity";
import { User } from "../../user/entity/user.entity";
import { ChannelDto } from "../dto/channel.dto";
import { Participation } from "./participation.entity";

@Entity()
export class Channel extends BaseEntity {

	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
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

	// @Column()
	// password: string;	// needs to be hashed with salt grains

	// @Column()
	// public privacy: number;

	static toDto(channel: Channel) {
		return plainToInstance(ChannelDto, instanceToPlain(channel), { excludeExtraneousValues: true })
	}
}