import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/user/service/auth.service';
import { User } from '../user/entity/user.entity';
import { FriendshipController } from './controller/friendship.controller';
import { Friendship } from './entity/friendship.entity';
import { FriendshipService } from './service/friendship.service';

@Module({
    imports: [TypeOrmModule.forFeature([Friendship, User]),
    JwtModule.register({
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        signOptions: {
            expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        }
    }),],
    controllers: [FriendshipController],
    providers: [FriendshipService, AuthService]
})
export class FriendshipModule {}
