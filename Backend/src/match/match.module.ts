import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MatchGateway } from './gateway/match.gateway';
import { MatchService } from './service/match.service';
import { Match } from './entity/match.entity';
import { MatchController } from './controller/match.controller';
import { User } from '../user/entity/user.entity';
import { AuthService } from '../user/service/auth.service';
import { NotificationService } from 'src/notifications/service/notification.service';
import { NotificationRepository } from 'src/notifications/repository/notification.repository';
import { Notification } from 'src/notifications/entity/notification.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Match, Notification, NotificationRepository]),
		JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            }
        }),
	],
	controllers: [MatchController],
	providers: [MatchService, MatchGateway, AuthService, NotificationService],
	exports: [MatchService]
})
export class MatchModule {}
