import { UseGuards, Logger, Request, Req } from '@nestjs/common';
import { MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthenticatedGuard } from 'src/guards/authenticated.guard';
import { FtOauthGuard } from 'src/guards/ft-oauth.guard';
import { WsGuard } from 'src/guards/websocket.guard';
import { CreateMsgDto } from '../dto/create-msg.dto';
import { ChatService } from '../service/chat/chat.service';
import * as session from 'express-session';
import * as passport from 'passport';
import { GetUser } from '../decorator/get-user.decorator';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	socket: Server;

	private logger: Logger = new Logger('ChatGateway');

	constructor(
		private readonly chatService: ChatService
		) {}
		
	@UseGuards(WsGuard)
	@SubscribeMessage('msg_to_server')						// this runs the function when the event msg_to_server is triggered
	async handleMessage(@MessageBody() createMsgDto: CreateMsgDto, @GetUser() author: string) {
		// this.logger.log(createMsgDto);
		
		
		const message = await this.chatService.saveMsg(createMsgDto.content, author);
		
		this.socket.emit('msg_to_client', message);	// emit an event to every clients listening on msg_to_client
	}
	
	afterInit(server: Server) {
		this.logger.log('Init');
	}
	
	@UseGuards(WsGuard)
	async handleConnection(socket: Socket, @Request() req, ...args: any[]) {
		this.logger.log(`socket connected: ${socket.id}`);

		// ? will send the content to every clients that are already connected
		// const messages = await this.chatService.getAllMessages();
		// messages.forEach((message) => {
		// 	const createMsgDto = {
		// 		content: message.content,
		// 		author: message.user.username
		// 	}
		// 	this.socket.emit('msg_to_client', createMsgDto);
		// })
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
