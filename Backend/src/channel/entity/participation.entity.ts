import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user/entity/user.entity";
import { Channel } from "./channel.entity";

@Entity()
export class Participation {

	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => User, user => user.participations, { eager: true })
	user: User;

	@ManyToOne(() => Channel, channel => channel.participations, { eager: true, onDelete:'CASCADE' })
	channel: Channel;

	@Column({ default: false })
	isModo: boolean;			//? a modo can not be ban
								//? a modo can ban/mute non modo/owner ppl

}
