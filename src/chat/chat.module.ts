import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { ChatService } from './service/chat/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Msg } from './entity/msg.entity';
import { ChatGateway } from './gateway/chat.gateway'
import { User } from 'src/user/entity/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/user/service/auth.service';
import { ChannelController } from 'src/channel/channel.controller';
import { ChannelService } from 'src/channel/service/channel.service';
import { Channel } from 'src/channel/entity/channel.entity';
import { Participation } from 'src/channel/entity/participation.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Msg, User, Channel, Participation]),
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
