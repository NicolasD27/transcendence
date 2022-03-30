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
import { UserService } from 'src/user/service/user/user.service';
import { CustomModes, Match } from '../entity/match.entity';
import { MatchService } from '../service/match.service';

@WebSocketGateway()
export class MatchGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	socket: Server;

	private logger: Logger = new Logger('MatchGateway');

	constructor(
		private readonly matchService: MatchService,
		private readonly userService: UserService
	) {}

	@UseGuards(WsGuard)
	@SubscribeMessage('connect_to_match')						// this runs the function when the event msg_to_server is triggered
	async connectToMatch(socket: Socket, data: { opponent_id: string, author: string}) {
		console.log(socket.rooms)
		const user = await this.userService.findByUsername(data.author);
		let match: Match = await this.matchService.createMatch({user1_id: user.id.toString(), user2_id: data.opponent_id, mode: CustomModes.NORMAL });
		socket.join("match#" + match.id);
		this.socket.to("match#" + match.id).emit('update_to_client', match)
		setInterval(async () => {
			match = await this.matchService.updatePositionMatch(match.id);
			this.socket.to("match#" + match.id).emit('update_to_client', match)
		}, 100) 
		
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('update_to_server')						// this runs the function when the event msg_to_server is triggered
	async updateMatch(socket: Socket, data: { match_id: string, command: string, author: string}) {
		console.log(data)
		const match = await this.matchService.updatePositionCurrentMatch(data.match_id, data.author, data.command);
		this.socket.to("match#" + data.match_id).emit('update_to_client', match)
		
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
