import { Module } from '@nestjs/common';
import { ChatService } from './service/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Msg } from './entity/msg.entity';
import { ChatGateway } from './gateway/message.gateway'
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { ChannelController } from '../channel/controller/channel.controller';
import { AuthService } from '../user/service/auth.service';
import { ChannelService } from '../channel/service/channel.service';
import { Channel } from '../channel/entity/channel.entity';
import { Participation } from 'src/channel/entity/participation.entity';
import { ModerationTimeOut } from 'src/channel/entity/moderationTimeOut.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Msg, User, Channel, Participation, ModerationTimeOut]),
		JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            }
        }),
	],
	controllers: [ChannelController],
	providers: [ChatService, ChatGateway, AuthService, ChannelService],
	exports: [ChatService]
})
export class ChatModule {}
