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
import { CreateMsgDto } from '../dto/create-msg.dto';
import { ChatService } from '../service/chat/chat.service';
import * as session from 'express-session';
import * as passport from 'passport';
import { GetUsername } from '../decorator/get-username.decorator';
import { WsGuard } from '../../guards/websocket.guard';

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
	async handleMessage(@MessageBody() createMsgDto: CreateMsgDto, @GetUsername() author: string) {
		const message = await this.chatService.saveMsg(createMsgDto.content, author);
		this.socket.emit('msg_to_client', message);	// emit an event to every clients listening on msg_to_client
	}

	// @UseGuards(WsGuard)
	// @SubscribeMessage('connect_to_channel')
	// async connectToMatch(socket: Socket, data: { opponent_id: string, author: string}) {
	// 	console.log(socket.rooms)
	// 	const user = await this.userService.findByUsername(data.author);
	// 	let match: Match = await this.matchService.createMatch(
	// 		{
	// 			user1_id: user.id.toString(),
	// 			user2_id: data.opponent_id,
	// 			mode: CustomModes.NORMAL 
	// 		});
	// 	socket.join("match#" + match.id);
	// 	setInterval(async () => {
	// 		match = await this.matchService.updatePositionMatch(match.id);
	// 		this.socket.to("match#" + match.id).emit('update_to_client', match)
	// 	}, 300) 
		
	// }

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
