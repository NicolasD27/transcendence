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
        private  usersRepository: Repository<User>
        ) {}

    async findAllByUser(user_id: string): Promise<NotificationDto[]> {
        const user = await this.usersRepository.findOne(user_id);
        if (!user)
            throw new NotFoundException(`user #${user_id} not found`)
        return this.notificationsRepository.find({
            where: [
                { receiver: user },
            ],
        })
        .then(items => items.map(e=> Notification.toDto(e)));
    }

    async create(parent: Friendship | Match, receiver: User): Promise<NotificationDto> {
        const notification = await this.notificationsRepository.create({
            receiver: receiver
        })
        notification.parent = parent
        return Notification.toDto(await this.notificationsRepository.save(notification))

    }

    
    async destroy(username: string, id: string): Promise<NotificationDto> {
        const notification = await this.notificationsRepository.findOne(id);
        if (!notification)
            throw new NotFoundException(`Notification #${id} not found`);
        if ((username != notification.receiver.username))
            throw new UnauthorizedException();
        return Notification.toDto(await this.notificationsRepository.remove(notification));

    }

}
