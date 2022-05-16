import { Friendship } from "src/friendship/entity/friendship.entity";
import { Match } from "src/match/entity/match.entity";
import { User } from "src/user/entity/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PolymorphicParent } from "typeorm-polymorphic";
import { NotificationDto } from "../dto/notification.dto";

export interface PolymorphicChildInterface {
    entityId: number | string;
    entityType: string;
}

@Entity('notification') 
export class Notification implements PolymorphicChildInterface {
    @PrimaryGeneratedColumn()
    id: number

    @PolymorphicParent(() => [Friendship, Match])
    parent: Friendship | Match;

    @Column()
    entityId: number;

    @Column()
    entityType: string;

    @ManyToOne(() => User, user => user.notifications, { eager: true })
    receiver: User;

    static toDto(notification: Notification): NotificationDto {
        
        const dto: NotificationDto = {
            id: notification.id,
            receiver: User.toDto(notification.receiver),
            entityId: notification.entityId,
            entityType: notification.entityType
        }
        return dto
    }
}