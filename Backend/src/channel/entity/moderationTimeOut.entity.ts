import { User } from "src/user/entity/user.entity";
import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Channel } from "./channel.entity";

@Entity()
export class ModerationTimeOut extends BaseEntity {

	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => User, user => user.moderationTimeOuts, { eager: true })
	user: User;

	@ManyToOne(() => Channel, channel => channel.moderationTimeOuts, { eager: true })
	channel: Channel;

}