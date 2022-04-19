import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user/entity/user.entity";
import { Channel } from "./channel.entity";
import { date } from "joi";

export enum BannedState {
	clean = 0,
	muted = 1,
	banned = 2,
}

@Entity()
export class Participation {

	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => User, user => user.participations, { eager: true })
	user: User;

	@ManyToOne(() => Channel, channel => channel.participations, { eager: true })
	channel: Channel;

	@Column({ default: false })
	isModo: boolean;			//? a modo can not be ban

	@Column({ default: BannedState.clean })
	bannedState: BannedState;

	@Column({
		nullable: false,
		default: () => 'CURRENT_TIMESTAMP',
		type: 'timestamp',
	})
	public date: Date;

}
