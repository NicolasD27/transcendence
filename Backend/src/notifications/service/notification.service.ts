import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { not } from 'joi';
import { Friendship } from 'src/friendship/entity/friendship.entity';
import { Match } from 'src/match/entity/match.entity';
import { UserDto } from 'src/user/dto/user.dto';
import { Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { NotificationDto } from '../dto/notification.dto';
import { Notification } from '../entity/notification.entity';
import { NotificationRepository } from '../repository/notification.repository';


@Injectable()
export class NotificationService {
    constructor(
        private  notificationsRepository: NotificationRepository,
        @InjectRepository(User)
        private  usersRepository: Repository<User>,
        @InjectRepository(Friendship)
        private  friendshipsRepository: Repository<Friendship>,
        @InjectRepository(Match)
        private  matchsRepository: Repository<Match>,
        ) {}

    async findAllByUser(user_id: string): Promise<NotificationDto[]>
    {
        const user = await this.usersRepository.findOne(user_id);
        if (!user)
            throw new NotFoundException(`user #${user_id} not found`)
        const notifications = await this.notificationsRepository.find({
            where: [
                { receiver: user },
            ],
        })
        let notificationsDto:NotificationDto[] = [];
        for(let i = 0; i < notifications.length; i++)
        {
            if (notifications[i].entityType == "Friendship") {
                await this.friendshipsRepository.findOne(notifications[i].entityId)
                .then(parent => {
                    notificationsDto.push(Notification.toFriendshipDto(notifications[i], parent));
                })
                
            }
            else if (notifications[i].entityType == "Match") {
                await this.matchsRepository.findOne(notifications[i].entityId)
                .then(parent => {
                    notificationsDto.push(Notification.toMatchDto(notifications[i], parent));
                })
            }                
        };
        return notificationsDto;
    }

    async create(parent: Friendship | Match, receiver: User): Promise<NotificationDto> {
        const notification = await this.notificationsRepository.create({
            receiver: receiver
        })
        notification.parent = parent
        await this.notificationsRepository.save(notification)
        let parentFind;
        if (notification.entityType == "Friendship") {
            parentFind = await this.friendshipsRepository.findOne(notification.entityId)
            return Notification.toFriendshipDto(notification, parentFind)
        }
        else if (notification.entityType == "Match") {
            parentFind = await this.matchsRepository.findOne(notification.entityId)
            return Notification.toMatchDto(notification, parentFind)
        }
    }

    
    async destroy(username: string, id: string): Promise<NotificationDto> {
        const notification = await this.notificationsRepository.findOne(id);
        if (!notification)
            throw new NotFoundException(`Notification #${id} not found`);
        if ((username != notification.receiver.username))
            throw new UnauthorizedException();
        let parentFind;
        await this.notificationsRepository.remove(notification);
        if (notification.entityType == "Friendship") {
            parentFind = await this.friendshipsRepository.findOne(notification.entityId)
            return Notification.toFriendshipDto(notification, parentFind)
        }
        else if (notification.entityType == "Match") {
            parentFind = await this.matchsRepository.findOne(notification.entityId)
            return Notification.toMatchDto(notification, parentFind)
        }
    }

    async actionPerformed(parent: Friendship | Match) {
        (await parent.notification).awaitingAction = false
    }

}
