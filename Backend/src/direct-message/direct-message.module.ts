import { Module } from '@nestjs/common';
import { DirectMessageService } from './service/direct-message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessage } from './entity/direct-message.entity';
import { DirectMessageGateway } from './gateway/direct-message.gateway'
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { ChannelController } from '../channel/controller/channel.controller';
import { AuthService } from '../user/service/auth.service';
import { ChannelService } from '../channel/service/channel.service';
import { Channel } from '../channel/entity/channel.entity';
import { Participation } from 'src/channel/entity/participation.entity';
import { ModerationTimeOut } from 'src/channel/entity/moderationTimeOut.entity';
import { FriendshipService } from 'src/friendship/service/friendship.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([DirectMessage, User]),
		JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            }
        }),
	],
	controllers: [],
	providers: [DirectMessageService, DirectMessageGateway, AuthService, FriendshipService],
	exports: [DirectMessageService]
})
export class DirectMessageModule {}