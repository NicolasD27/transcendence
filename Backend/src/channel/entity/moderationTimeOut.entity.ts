import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";

export enum BannedState {
	redemption = 0,
	muted = 1,
	banned = 2,
}

@Entity()
export class ModerationTimeOut extends BaseEntity {

	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => User, user => user.moderationTimeOuts, { eager: true })
	user: User;

	@ManyToOne(() => Channel, channel => channel.moderationTimeOuts, { eager: true })
	channel: Channel;

	@Column({ nullable: false })
	bannedState: BannedState;

	@Column({
		nullable: false,
		default: () => 'CURRENT_TIMESTAMP',
		type: 'timestamp',
	})
	public date: Date;

}