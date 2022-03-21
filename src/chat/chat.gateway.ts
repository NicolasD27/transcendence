import { UseGuards, Logger, Request } from '@nestjs/common';
import {  MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthenticatedGuard } from 'src/guards/authenticated.guard';
import { FtOauthGuard } from 'src/guards/ft-oauth.guard';
import { CreateMsgDto } from './dto/create-msg.dto';
import { ChatService } from './service/chat/chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	socket: Server;

	private logger: Logger = new Logger('ChatGateway');

	constructor(
		private readonly chatService: ChatService
	) {}

	@UseGuards(FtOauthGuard)
	@SubscribeMessage('msg_to_server')						// this runs the function when the event msg_to_server is triggered
	async handleMessage(@MessageBody() createMsgDto: CreateMsgDto, @Request() req) {
		
		this.logger.log(createMsgDto);

		console.log(req);
		
		const message = await this.chatService.saveMsg(createMsgDto.content, req.user.username);

		this.socket.emit('msg_to_client', createMsgDto);	// emit an event to every clients listening on msg_to_client
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	handleConnection(client: Socket, ...args: any[]) {
		this.logger.log(`Client connected: ${client.id}`);
	}
}
