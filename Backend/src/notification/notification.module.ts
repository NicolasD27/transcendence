import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { AuthService } from '../user/service/auth.service';
import { Match } from 'src/match/entity/match.entity';
import { Notification } from './entity/notification.entity';
import { NotificationRepository } from './repository/notification.repository';
import { NotificationService } from './service/notification.service';
import { NotificationController } from './controller/notification.controller';
import { Friendship } from 'src/friendship/entity/friendship.entity';
import { FriendshipRepository } from 'src/friendship/repository/friendship.repository';
import { MatchRepository } from 'src/match/repository/match.repository';

@Module({
	imports: [
        TypeOrmModule.forFeature([
            Notification,
            NotificationRepository,
            Friendship,
            FriendshipRepository,
            Match,
            MatchRepository
          ]),
		JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            }
        }),
	],
	controllers: [NotificationController],
	providers: [NotificationService],
	exports: [NotificationService, TypeOrmModule]
})
export class NotificationModule {}
