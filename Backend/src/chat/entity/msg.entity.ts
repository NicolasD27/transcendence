import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Channel } from "../../channel/entity/channel.entity";
import { User } from "../../user/entity/user.entity";

@Entity()
export class Msg {
	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => Channel, channel => channel.messages, { eager: true })
	channel: Channel;

	@Column()
	public content: string;

	@Column({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP' ,
        type: 'timestamp',
    })
    public date: Date;

	@ManyToOne(() => User, user => user.messages, { eager: true })	// when real users will be used
	user: User;

	// @Column({
	// 	type: 'datetime',
	// 	default: () => 'NOW()',
	// })
	// @Index()
	// start: string;
}
