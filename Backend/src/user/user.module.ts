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
import { UserService } from './service/user/user.service';
import { User } from './entity/user.entity';
import { config } from 'process';


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
<<<<<<< HEAD
        // JwtModule.register({}),
        TypeOrmModule.forFeature([User])
=======
        TypeOrmModule.forFeature([User, Friendship, DatabaseFile, Match])
>>>>>>> master
    ],
    controllers: [AuthController, TwoFactorAuth, UserController],
    providers: [
        ConfigService,
        AuthService,
        TwoFactorAuthService,
        FtStrategy,
        SessionSerializer,
        UserService
    ],
    exports: [
        FtStrategy,
        PassportModule,
		UserService,
		TypeOrmModule
    ]
})
export class UserModule {}
