import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { ChatService } from './service/chat/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Msg } from './entity/msg.entity';
import { ChatGateway } from './chat.gateway'
import { User } from 'src/user/entity/user.entity';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/user/service/auth.service';
import { ChatController } from './chat.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([Msg, User]),
		JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            }
        }),
	],
	controllers: [ChatController],
	providers: [ChatService, ChatGateway, AuthService],
	exports: [ChatService]
})
export class ChatModule {}
