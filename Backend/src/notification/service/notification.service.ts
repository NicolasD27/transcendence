import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { not } from 'joi';
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';
import { ChannelInvite } from 'src/channel/entity/channelInvite.entity';
import { Friendship } from 'src/friendship/entity/friendship.entity';
import { FriendshipRepository } from 'src/friendship/repository/friendship.repository';
import { Match } from 'src/match/entity/match.entity';
import { MatchRepository } from 'src/match/repository/match.repository';
import { UserDto } from 'src/user/dto/user.dto';
import { Connection, Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { NotificationDto } from '../dto/notification.dto';
import { Notification } from '../entity/notification.entity';
import { NotificationRepository } from '../repository/notification.repository';


@Injectable()
export class NotificationService {
    constructor(
        
		private notificationsRepository: NotificationRepository,
        @InjectRepository(User)
        private  usersRepository: Repository<User>,
        @InjectRepository(Friendship)
		private friendshipsRepository: Repository<Friendship>,
        @InjectRepository(Match)
		private matchsRepository: Repository<Match>,
        @InjectRepository(ChannelInvite)
		private channelInvitesRepository: Repository<ChannelInvite>,
        // private connection: Connection
        ) {
            // notificationsRepository = connection.getCustomRepository(NotificationRepository)
            // friendshipsRepository = connection.getCustomRepository(FriendshipRepository)
            // matchsRepository = connection.getCustomRepository(MatchRepository)
        }

    async findAllByUser(user_id: string, paginationQuery: PaginationQueryDto): Promise<NotificationDto[]>
    {
        const user = await this.usersRepository.findOne(user_id);
        if (!user)
            throw new NotFoundException(`user #${user_id} not found`)
        const notifications = await this.notificationsRepository.find({
            where: [
                { receiver: user },
            ],
			order: { id: "DESC" },
			take: paginationQuery.limit,
			skip: paginationQuery.offset,
        });
        let notificationsDto:NotificationDto[] = [];
        for(let i = 0; i < notifications.length; i++)
        {
            if (notifications[i].entityType == "Friendship") {
                await this.friendshipsRepository.findOne(notifications[i].entityId)
                .then(parent => {
                    if (parent)
                        notificationsDto.push(Notification.toFriendshipDto(notifications[i], parent));
                })
                
            }
            else if (notifications[i].entityType == "Match") {
                await this.matchsRepository.findOne(notifications[i].entityId)
                .then(parent => {
                    if (parent)
                        notificationsDto.push(Notification.toMatchDto(notifications[i], parent));
                })
            }     
            else if (notifications[i].entityType == "ChannelInvite") {
                await this.channelInvitesRepository.findOne(notifications[i].entityId)
                .then(parent => {
                    if (parent)
                        notificationsDto.push(Notification.toChannelInviteDto(notifications[i], parent));
                })
            }              
        };
        return notificationsDto;
    }

    async create(parent: Friendship | Match | ChannelInvite, receiver: User): Promise<Notification> {
        const notification = await this.notificationsRepository.create({
            receiver: receiver,
            parent: parent
        })
        await this.notificationsRepository.save(notification)
        return notification
    }

    
    async destroy(username: string, id: string): Promise<Notification> {
        const notification = await this.notificationsRepository.findOne(id);
        if (!notification)
            throw new NotFoundException(`Notification #${id} not found`);
        if ((username != notification.receiver.username))
            throw new UnauthorizedException();
        let parentFind;
        await this.notificationsRepository.remove(notification);
        return notification
    }

    async actionPerformedMatch(parent: Match) {
        let notification = await this.notificationsRepository.findOne({
            where: {
                entityId: parent.id,
                entityType: "Match"
            }
        })
        if (notification) {

            notification.awaitingAction = false
            notification = await this.notificationsRepository.save(notification)
            console.log(notification)
        }
    }

    async actionPerformedFriendship(parent: Friendship) {
        let notification = await this.notificationsRepository.findOne({
            where: {
                entityId: parent.id,
                entityType: "Friendship"
            }
        })
        if (notification) {

            notification.awaitingAction = false
            notification = await this.notificationsRepository.save(notification)
            console.log(notification)
        }
    }

    async actionPerformedChannelInvite(parent: ChannelInvite) {
        let notification = await this.notificationsRepository.findOne({
            where: {
                entityId: parent.id,
                entityType: "ChannelInvite"
            }
        })
        if (notification) {

            notification.awaitingAction = false
            notification = await this.notificationsRepository.save(notification)
            console.log(notification)
        }
    }
    

}
