import { UseGuards, Logger, Request } from '@nestjs/common';
import { MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	 } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GetUser } from 'src/chat/decorator/get-user.decorator';
import { WsGuard } from 'src/guards/websocket.guard';
import { MatchService } from '../service/match.service';

@WebSocketGateway()
export class MatchGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	socket: Server;

	private logger: Logger = new Logger('MatchGateway');

	constructor(
		private readonly matchService: MatchService
	) {}

	@UseGuards(WsGuard)
	@SubscribeMessage('connect_to')						// this runs the function when the event msg_to_server is triggered
	async connectToMatch(socket: Socket, data: {room: string}) {
		console.log(socket.rooms)
		socket.join(data.room)
		console.log("room : ", data.room);
		
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('update_to_server')						// this runs the function when the event msg_to_server is triggered
	async updateMatch(socket: Socket, data: { room: string, command: string, author: string}) {
		console.log(data)
		const match = await this.matchService.updatePositionCurrentMatch(data.author, data.command);
		this.socket.to(data.room).emit('update_to_client', match)
		
	}


	afterInit(server: Server) {
		this.logger.log('Init');
	}
	
	async handleConnection(socket: Socket, @Request() req, ...args: any[]) {
		this.logger.log(`socket connected: ${socket.id}`);
		
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
