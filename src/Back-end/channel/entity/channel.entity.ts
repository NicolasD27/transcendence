import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/Back-end/user/entity/user.entity";
import { Msg } from "src/Back-end/chat/entity/msg.entity";

@Entity()
export class Channel {

	@PrimaryGeneratedColumn()
	public id: number;

	@Column()
	public name: string;

	@Column()
	public description: string;

	@ManyToOne(() => User, user => user.channels, { eager: true })
	owner: User;

	@OneToMany(() => Msg, msg => msg.channel)
	messages: Msg[];

	// @Column()
	// password: string;	// needs to be hashed with salt grains

	// @Column()
	// public privacy: number;
}