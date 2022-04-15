import { Channel } from "diagnostics_channel";
import { User } from "src/user/entity/user.entity";
import { BaseEntity, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ModerationTimeOut extends BaseEntity {

	@PrimaryGeneratedColumn()
	public id: number;

	// @ManyToOne(() => User, user => user.moderationTimeOut, { eager: true })
	// user: User;

	// @ManyToOne(() => Channel, channel => channel.moderationTimeOut, { eager: true })
	// channel: Channel;

}