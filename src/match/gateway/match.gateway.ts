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
import { GetUsername } from 'src/chat/decorator/get-username.decorator';
import { WsGuard } from 'src/guards/websocket.guard';
import { UserService } from 'src/user/service/user/user.service';
import { CustomModes, Match, MatchStatus } from '../entity/match.entity';
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
		const user = await this.userService.findByUsername(data.author);
		let match: Match = await this.matchService.createMatch({user1_id: user.id.toString(), user2_id: data.opponent_id, mode: CustomModes.NORMAL });
		socket.join("match#" + match.id);
		this.socket.to("match#" + match.id).emit('update_to_client', match)
		setInterval(async () => {
			match = await this.matchService.updatePositionMatch(match.id);
			this.socket.to("match#" + match.id).emit('update_to_client', match)
		}, 30) 
		
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('find_match')						// this runs the function when the event msg_to_server is triggered
	async findMatch(socket: Socket, data: { author: string}) {
		let match = await this.matchService.matchmaking(data.author, CustomModes.NORMAL );
		socket.join("match#" + match.id);
		if (match.status == MatchStatus.ACTIVE) {
			this.socket.to("match#" + match.id).emit('launch_match', match)	
			setInterval(async () => {
				match = await this.matchService.updatePositionMatch(match.id);
				this.socket.to("match#" + match.id).emit('update_to_client', match)
			}, 100) 	
		}
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('challenge_user')						// this runs the function when the event msg_to_server is triggered
	async challengeUser(socket: Socket, data: { opponent_id: string, author: string}) {
		const user = await this.userService.findByUsername(data.author);
		const match: Match = await this.matchService.createMatch({user1_id: user.id.toString(), user2_id: data.opponent_id, mode: CustomModes.NORMAL });
		socket.join("match#" + match.id);
		console.log("match : ", match)
		this.socket.to("user#" + data.opponent_id).emit('match_invite_to_client', match)
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('accept_challenge')						// this runs the function when the event msg_to_server is triggered
	async acceptMatchInvite(socket: Socket, data: { match_id: string, author: string}) {
		const user = await this.userService.findByUsername(data.author);
		let match = await this.matchService.updateMatch(data.author, data.match_id, {status: MatchStatus.ACTIVE});
		socket.join("match#" + match.id);
		
		this.socket.to("match#" + match.id).emit('launch_match', match)	
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
	
	async handleConnection(socket: Socket) {
		this.logger.log(`match socket connected: ${socket.id}`);
		const cookies = socket.handshake.headers.cookie.split('; ')
		if (cookies.find((cookie: string) => cookie.startsWith('username')))
		{
			const username = cookies.find((cookie: string) => cookie.startsWith('username')).split('=')[1];
			const user = await this.userService.findByUsername(username);
			socket.join("user#" + user.id);
		}
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
