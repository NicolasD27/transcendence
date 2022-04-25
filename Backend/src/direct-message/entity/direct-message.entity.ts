import { instanceToPlain, plainToInstance } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "../../user/entity/user.entity";
import { DirectMessageDto } from "../dto/direct-message.dto";

@Entity()
export class DirectMessage {
	@PrimaryGeneratedColumn()
	public id: number;

	

	@Column()
	public content: string;

	@Column({
		nullable: false,
		default: () => 'CURRENT_TIMESTAMP',
		type: 'timestamp',
	})
	public date: Date;

	@ManyToOne(() => User, user => user.directMessagesSent, { eager: true, cascade: true, onDelete: 'CASCADE' })	// when real users will be used
	sender: User;

	@ManyToOne(() => User, user => user.directMessagesReceived, { eager: true, cascade: true, onDelete: 'CASCADE' })	// when real users will be used
	receiver: User;

	static toDto(directMessage: DirectMessage) {
		const dto: DirectMessageDto = {
			id: directMessage.id,
			sender: User.toDto(directMessage.sender),
			receiver: User.toDto(directMessage.receiver),
			content: directMessage.content,
			date: directMessage.date
		}
		return dto;
	}
}
