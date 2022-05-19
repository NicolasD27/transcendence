import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth/auth.controller';
import { UserRepository } from './repository/user.repository';
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
import { UserService } from './service/user/user.service';

// const dbConfig = config.get('jwt')

@Global()
@Module({
    imports: [
        // PassportModule.register({ defaultStrategy: 'jwt' }),
        // JwtModule.register({
        //     secret: process.env.JWT_ACCESS_TOKEN_SECRET || dbConfig.secret,
        //     signOptions: {
        //         expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || dbConfig.secret
        //     }
        // }),
        PassportModule.register({}),
        JwtModule.register({}),
        TypeOrmModule.forFeature([UserRepository])
    ],
    controllers: [AuthController, TwoFactorAuth, UserController],
    providers: [
        ConfigService,
        AuthService,
        TwoFactorAuthService,
        FtStrategy,
        JwtStrategy,
        JwtRefreshStrategy,
        JwtTwoFaStrategy,
        SessionSerializer,
        UserService
    ],
    exports: [
        FtStrategy,
        JwtStrategy,
        JwtRefreshStrategy,
        PassportModule,
        JwtTwoFaStrategy
    ]
})
export class UserModule {}