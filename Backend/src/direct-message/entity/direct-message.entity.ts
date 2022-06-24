import { instanceToPlain, plainToInstance } from "class-transformer";
import { ActiveUsers } from "src/user/entity/active-user";
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

	static toDto(directMessage: DirectMessage, _activeUsers: ActiveUsers) : DirectMessageDto {
		const dto: DirectMessageDto = {
			id: directMessage.id,
			sender: User.toDto(directMessage.sender, _activeUsers),
			receiver: User.toDto(directMessage.receiver, _activeUsers),
			content: directMessage.content,
			date: directMessage.date
		}
		return dto;
	}
}
