import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth/auth.controller';
import { AuthService } from './service/auth.service';
import { TwoFactorAuthService } from './service/two-factor-auth.service';
import { TwoFactorAuth } from './controller/auth/two-factor-auth.controller';

// import * as config from 'config'
import { ConfigService } from '@nestjs/config';
import { FtStrategy } from './strategy/ft.strategy';
import { SessionSerializer } from './session.serializer';
import { UserController } from './controller/user/user.controller';
import { User } from './entity/user.entity';
import { config } from 'process';
import { UserGateway } from './gateway/user.gateway';
import { FriendshipService } from 'src/friendship/service/friendship.service';
import { Friendship } from 'src/friendship/entity/friendship.entity';
import DatabaseFilesService from './service/database-file.service';
import DatabaseFile from './entity/database-file.entity';
import DatabaseFilesController from './controller/database-file/database-file.controller';
import { UserService } from './service/user.service';
import { MatchService } from 'src/match/service/match.service';
import { Match } from 'src/match/entity/match.entity';
import { NotificationService } from 'src/notification/service/notification.service';
import { Notification } from 'src/notification/entity/notification.entity';
import { NotificationRepository } from 'src/notification/repository/notification.repository';
import { FriendshipRepository } from '../friendship/repository/friendship.repository';
import { MatchRepository } from '../match/repository/match.repository';
import { ChannelService } from 'src/channel/service/channel.service';
import { ChannelModule } from 'src/channel/channel.module';


@Global()
@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME 
            }
        }),
        PassportModule.register({}),
        TypeOrmModule.forFeature([User, Friendship, FriendshipRepository, DatabaseFile, Match, MatchRepository, Notification, NotificationRepository])
    ],
    controllers: [AuthController, TwoFactorAuth, UserController, DatabaseFilesController],
    providers: [
        ConfigService,
        AuthService,
        TwoFactorAuthService,
        FtStrategy,
        SessionSerializer,
        UserService,
        FriendshipService,
        UserGateway,
        DatabaseFilesService,
        MatchService,
        NotificationService
    ],
    exports: [
        FtStrategy,
        PassportModule,
		UserService,
		TypeOrmModule,
        AuthService
    ]
})
export class UserModule {}
