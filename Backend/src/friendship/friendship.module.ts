import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/notifications/entity/notification.entity';
import { NotificationRepository } from 'src/notifications/repository/notification.repository';
import { NotificationService } from 'src/notifications/service/notification.service';
import { AuthService } from 'src/user/service/auth.service';
import { User } from '../user/entity/user.entity';
import { FriendshipController } from './controller/friendship.controller';
import { Friendship } from './entity/friendship.entity';
import { FriendshipService } from './service/friendship.service';

@Module({
    imports: [TypeOrmModule.forFeature([Friendship, User, Notification, NotificationRepository]),
    JwtModule.register({
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        signOptions: {
            expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        }
    }),],
    controllers: [FriendshipController],
    providers: [FriendshipService, AuthService, NotificationService]
})
export class FriendshipModule {}
