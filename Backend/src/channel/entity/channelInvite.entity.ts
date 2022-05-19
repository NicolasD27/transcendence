import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChannelInviteDto } from "../dto/channel-invite.dto";
import { Channel } from "./channel.entity";

@Entity()
export class ChannelInvite extends BaseEntity {

	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => Channel, channel => channel.channelInvites, { eager: true, cascade: true, onDelete:'CASCADE' })
	channel: Channel;

	@ManyToOne(() => User, user => user.channelInviteSenders, { eager: true })
	sender: User;

	@ManyToOne(() => User, user => user.channelInviteReceivers, { eager: true })
	receiver: User;

	@Column({
		nullable: false,
		default: () => 'CURRENT_TIMESTAMP',
		type: 'timestamp',
	})
	public date: Date;

	static toDto(channelInvite: ChannelInvite) {
		const myDto: ChannelInviteDto = {
			id: channelInvite.id,
			channel: Channel.toDto(channelInvite.channel),
			sender: User.toDto(channelInvite.sender),
			receiver: User.toDto(channelInvite.receiver),
		}
		return myDto;
	}
}