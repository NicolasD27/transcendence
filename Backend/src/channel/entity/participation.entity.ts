import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user/entity/user.entity";
import { Msg } from "src/message/entity/msg.entity";
import { Channel } from "./channel.entity";

@Entity()
export class Participation {

	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => User, user => user.participations, { eager: true })
	user: User;

    @ManyToOne(() => Channel, channel => channel.participations, { eager: true })
	channel: Channel;

	// @Column()
	// password: string;	// needs to be hashed with salt grains

	// @Column()
	// public privacy: number;
}