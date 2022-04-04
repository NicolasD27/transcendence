import { User } from "src/user/entity/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Channel } from "src/channel/entity/channel.entity";

@Entity()
export class Msg {
	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => Channel, channel => channel.messages, { eager: true })
	channel: Channel;

	@Column()
	public content: string;
	
	@ManyToOne(() => User, user => user.messages, { eager: true })	// when real users will be used
	user: User;

	// @Column({
	// 	type: 'datetime',
	// 	default: () => 'NOW()',
	// })
	// @Index()
	// start: string;
}
