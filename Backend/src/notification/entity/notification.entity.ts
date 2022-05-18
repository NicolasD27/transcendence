import { Friendship } from "src/friendship/entity/friendship.entity";
import { Match } from "src/match/entity/match.entity";
import { User } from "src/user/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PolymorphicParent } from "typeorm-polymorphic";
import { PolymorphicChildInterface } from "typeorm-polymorphic/dist/polymorphic.interface";
import { NotificationDto } from "../dto/notification.dto";



@Entity('notification') 
export class Notification implements PolymorphicChildInterface {
    con
    @PrimaryGeneratedColumn()
    id: number

    @PolymorphicParent(() => [Friendship, Match], {
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
            entityId: parent.id,
            entityType: "Match",
            awaitingAction: notification.awaitingAction
        }
        return dto
    }
}