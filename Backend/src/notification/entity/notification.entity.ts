import { Friendship } from "src/friendship/entity/friendship.entity";
import { Match } from "src/match/entity/match.entity";
import { User } from "src/user/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PolymorphicParent } from "typeorm-polymorphic";
import { PolymorphicChildInterface } from "typeorm-polymorphic/dist/polymorphic.interface";
import { NotificationDto } from "../dto/notification.dto";
import { ChannelInvite } from '../../channel/entity/channelInvite.entity';



@Entity('notifications') 
export class Notification implements PolymorphicChildInterface {
    @PrimaryGeneratedColumn()
    id: number

    @PolymorphicParent(() => [Friendship, Match, ChannelInvite], {
        eager: false
    })
    parent: Friendship | Match;

    @Column()
    entityId: number;

    @Column()
    entityType: string;

    @ManyToOne(() => User, user => user.notifications, { eager: true })
    receiver: User;

    @Column({default: true})
    awaitingAction: boolean

    static toFriendshipDto(notification: Notification, parent: Friendship): NotificationDto {
        
        const dto: NotificationDto = {
            id: notification.id,
            receiver: User.toDto(notification.receiver),
            name: parent.follower.pseudo,
            senderId: parent.follower.id,
            entityId: parent.id,
            entityType: "Friendship",
            awaitingAction: notification.awaitingAction
        }
        return dto
    }

    static toMatchDto(notification: Notification, parent: Match): NotificationDto {
        
        const dto: NotificationDto = {
            id: notification.id,
            receiver: User.toDto(notification.receiver),
            name: parent.user1.pseudo,
            senderId: parent.user1.id,
            entityId: parent.id,
            entityType: "Match",
            awaitingAction: notification.awaitingAction
        }
        return dto
    }

    static toChannelInviteDto(notification: Notification, parent: ChannelInvite): NotificationDto {
        
        const dto: NotificationDto = {
            id: notification.id,
            receiver: User.toDto(notification.receiver),
            name: parent.sender.pseudo,
            senderId: parent.sender.id,
            entityId: parent.id,
            entityType: "ChannelInvite",
            awaitingAction: notification.awaitingAction,
            secondName: parent.channel.name
        }
        return dto
    }
}