import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Msg } from "../../chat/entity/msg.entity";
import { User } from "../../user/entity/user.entity";

@Entity()
export class Channel extends BaseEntity {

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