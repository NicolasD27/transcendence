import { Module } from '@nestjs/common';
import { AppController } from 'src/Back-end/app.controller';
import { ChatService } from './service/chat/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Msg } from './entity/msg.entity';
import { ChatGateway } from './gateway/chat.gateway'
import { User } from 'src/Back-end/user/entity/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/Back-end/user/service/auth.service';
import { ChannelController } from 'src/Back-end/channel/channel.controller';
import { ChannelService } from 'src/Back-end/channel/service/channel.service';
import { Channel } from 'src/Back-end/channel/entity/channel.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Msg, User, Channel]),
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
export class ChatModule { }
