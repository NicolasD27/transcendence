import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ChatService } from "./service/chat/chat.service";
import { FtOauthGuard } from "src/Back-end/guards/ft-oauth.guard";
import { AuthGuard } from "@nestjs/passport";
import { CreateMsgDto } from "./dto/create-msg.dto";
import { AuthenticatedGuard } from "src/Back-end/guards/authenticated.guard";

// @Controller('channels/:id')
// export class ChatController {
	// constructor (private readonly chatService: ChatService) {}

	// @UseGuards(AuthenticatedGuard)
	// @Get()
	// async findAll() {
	// 	return this.chatService.getAllMessages();
	// }

// }