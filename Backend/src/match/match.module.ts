import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MatchGateway } from './gateway/match.gateway';
import { MatchService } from './service/match.service';
import { Match } from './entity/match.entity';
import { MatchController } from './controller/match.controller';
import { User } from '../user/entity/user.entity';
import { AuthService } from '../user/service/auth.service';
import { NotificationService } from 'src/notification/service/notification.service';
import { NotificationRepository } from 'src/notification/repository/notification.repository';
import { Notification } from 'src/notification/entity/notification.entity';
import { MatchRepository } from './repository/match.repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Match, MatchRepository, Notification, NotificationRepository]),
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
