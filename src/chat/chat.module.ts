import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { ChatService } from './service/chat/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Msg } from './entity/msg.entity';
import { ChatGateway } from './chat.gateway'
import { User } from 'src/user/entity/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Msg, User])],
	controllers: [AppController],
	providers: [ChatService, ChatGateway],
	exports: [ChatService]
})
export class ChatModule {}
