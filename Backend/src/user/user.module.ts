import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtStrategy } from './strategy/jwt-strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh-strategy';
import { TwoFactorAuthService } from './service/two-factor-auth.service';
import { TwoFactorAuth } from './controller/auth/two-factor-auth.controller';
import { JwtTwoFaStrategy } from './strategy/jwt-2fa-strategy';

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

// const dbConfig = config.get('jwt')

@Global()
@Module({
    imports: [
        // PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME 
            }
        }),
        PassportModule.register({}),
        // JwtModule.register({}),
        TypeOrmModule.forFeature([User, Friendship, DatabaseFile])
    ],
    controllers: [AuthController, TwoFactorAuth, UserController, DatabaseFilesController],
    providers: [
        ConfigService,
        AuthService,
        TwoFactorAuthService,
        FtStrategy,
        JwtStrategy,
        JwtRefreshStrategy,
        JwtTwoFaStrategy,
        SessionSerializer,
        UserService,
        FriendshipService,
        UserGateway,
        DatabaseFilesService
    ],
    exports: [
        FtStrategy,
        JwtStrategy,
        JwtRefreshStrategy,
        PassportModule,
        JwtTwoFaStrategy,
		UserService,
		TypeOrmModule
    ]
})
export class UserModule {}
