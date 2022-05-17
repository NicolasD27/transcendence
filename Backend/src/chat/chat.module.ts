import { Module } from '@nestjs/common';
import { ChatService } from './service/chat/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Msg } from './entity/msg.entity';
import { ChatGateway } from './gateway/chat.gateway'
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User } from '../user/entity/user.entity';
import { ChannelController } from '../channel/channel.controller';
import { AuthService } from '../user/service/auth.service';
import { ChannelService } from '../channel/service/channel.service';
import { Channel } from '../channel/entity/channel.entity';
<<<<<<< HEAD:Backend/src/chat/chat.module.ts

@Module({
	imports: [
		TypeOrmModule.forFeature([Msg, User, Channel]),
=======
import { Participation } from 'src/channel/entity/participation.entity';
import { ModerationTimeOut } from 'src/channel/entity/moderationTimeOut.entity';
import { ChannelInvite } from 'src/channel/entity/channelInvite.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Msg, User, Channel, Participation,
			ModerationTimeOut, ChannelInvite
		]),
>>>>>>> master:Backend/src/message/message.module.ts
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
