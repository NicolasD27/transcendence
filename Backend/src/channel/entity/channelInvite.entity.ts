import { Notification } from "src/notification/entity/notification.entity";
import { ActiveUsers } from "src/user/entity/active-user";
import { User } from "src/user/entity/user.entity";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PolymorphicChildren } from "typeorm-polymorphic";
import { ChannelInviteDto } from "../dto/channel-invite.dto";
import { Channel } from "./channel.entity";

@Entity('channel_invites')
export class ChannelInvite {

	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => Channel, channel => channel.channelInvites, { eager: true, cascade: true, onDelete:'CASCADE' })
	channel: Channel;

	@ManyToOne(() => User, user => user.channelInviteSenders, { eager: true })
	sender: User;

	@ManyToOne(() => User, user => user.channelInviteReceivers, { eager: true })
	receiver: User;

	@PolymorphicChildren(() => Notification)
    notification: Notification;

	@Column({
		nullable: false,
		default: () => 'CURRENT_TIMESTAMP',
		type: 'timestamp',
	})
	public date: Date;

	static toDto(channelInvite: ChannelInvite, _activeUsers: ActiveUsers) : ChannelInviteDto {
		const myDto: ChannelInviteDto = {
			id: channelInvite.id,
			channel: Channel.toDto(channelInvite.channel, _activeUsers),
			sender: User.toDto(channelInvite.sender, _activeUsers),
			receiver: User.toDto(channelInvite.receiver, _activeUsers),
		}
		return myDto;
	}
}