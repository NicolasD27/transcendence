import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat/service/chat/chat.service';

@Controller('app')
export class AppController {
	constructor(
		// private readonly appService: AppService,
		private readonly chatService: ChatService) {}
	@Get('channels/:id')	// id will be the channel's id
	findAll() {
		return this.chatService.getAllMessages(); //getAllQuery();
	}
}
