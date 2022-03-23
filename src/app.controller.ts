import { Controller, Get } from '@nestjs/common';
import { ChatService } from './chat/service/chat/chat.service';
import { UseGuards } from '@nestjs/common';
import { Redirect } from '@nestjs/common';
import { FtOauthGuard } from './guards/ft-oauth.guard';

@Controller('app')
export class AppController {
	constructor (
		// private readonly appService: AppService,
		private readonly chatService: ChatService)
	{}

	@UseGuards(FtOauthGuard)
	@Redirect('/api')
	@Get('channels/:id')	// id will be the channel's id
	findAll() {
		return this.chatService.getAllMessages(); //getAllQuery();
	}
}
