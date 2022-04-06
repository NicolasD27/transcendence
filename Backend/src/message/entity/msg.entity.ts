import { instanceToPlain, plainToInstance } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Channel } from "../../channel/entity/channel.entity";
import { User } from "../../user/entity/user.entity";
import { MsgDto } from "../dto/message.dto";

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

	@Column({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP' ,
        type: 'timestamp',
      })
    public date: Date;

	static toDto(msg: Msg) {
		return plainToInstance(MsgDto, instanceToPlain(msg), { excludeExtraneousValues: true })
	}
}
