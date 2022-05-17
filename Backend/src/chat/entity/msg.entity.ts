import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Channel } from "../../channel/entity/channel.entity";
import { User } from "../../user/entity/user.entity";

@Entity()
export class Msg {
	@PrimaryGeneratedColumn()
	public id: number;

<<<<<<< HEAD:Backend/src/chat/entity/msg.entity.ts
	@ManyToOne(() => Channel, channel => channel.messages, { eager: true })
=======
	@ManyToOne(() => Channel, channel => channel.messages, { eager: true, cascade: true, onDelete:'CASCADE' })
>>>>>>> master:Backend/src/message/entity/msg.entity.ts
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
