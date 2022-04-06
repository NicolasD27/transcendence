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
	async handleMessage(socket: Socket, data: { activeChannelId: string, author: string, content: string }) {

		console.log("msg_to_server " + data.activeChannelId);
		const message = await this.chatService.saveMsg(data.content, data.activeChannelId, data.author);
		const msgDto: CreateMsgDto = {
			content: message.content,
			authorId: message.user.id,
			date: message.date,
		}

		this.socket.to("channel#" + data.activeChannelId).emit('msg_to_client', msgDto)
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('connect_to_channel')
	async connectToChannel(socket: Socket, data: { channelId: string }) {
		console.log("connect_to_channel channelId : " + data.channelId);
		socket.join("channel#" + data.channelId);
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}
	
	@UseGuards(WsGuard)
	async handleConnection(socket: Socket, @Request() req, ...args: any[]) {
		this.logger.log(`socket connected: ${socket.id}`);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
