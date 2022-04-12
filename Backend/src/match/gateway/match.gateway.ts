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
import { WsGuard } from '../../guards/websocket.guard';
import { UserService } from '../../user/service/user/user.service';
import { CustomModes, Match, MatchStatus } from '../entity/match.entity';
import { MatchService } from '../service/match.service';

@WebSocketGateway()
export class MatchGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

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
		this.server.to("match#" + match.id).emit('update_to_client', match)
		setInterval(async () => {
			match = await this.matchService.updatePositionMatch(match.id);
			this.server.to("match#" + match.id).emit('update_to_client', match)
		}, 30) 
		
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('find_match')						// this runs the function when the event msg_to_server is triggered
	async findMatch(socket: Socket, data: { author: string}) {
		let match = await this.matchService.matchmaking(data.author, CustomModes.NORMAL );
		socket.join("match#" + match.id);
		if (match.status == MatchStatus.ACTIVE) {
			this.server.to("match#" + match.id).emit('launch_match', match)	
			setInterval(async () => {
				match = await this.matchService.updatePositionMatch(match.id);
				this.server.to("match#" + match.id).emit('update_to_client', match)
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
		this.server.to("user#" + data.opponent_id).emit('match_invite_to_client', match)
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('accept_challenge')						// this runs the function when the event msg_to_server is triggered
	async acceptMatchInvite(socket: Socket, data: { match_id: string, author: string}) {
		const user = await this.userService.findByUsername(data.author);
		let match = await this.matchService.updateMatch(data.author, data.match_id, {status: MatchStatus.ACTIVE});
		socket.join("match#" + match.id);
		
		this.server.to("match#" + match.id).emit('launch_match', match)	
		setInterval(async () => {
			match = await this.matchService.updatePositionMatch(match.id);
			this.server.to("match#" + match.id).emit('update_to_client', match)
		}, 100) 	
	}


	@UseGuards(WsGuard)
	@SubscribeMessage('update_to_server')						// this runs the function when the event msg_to_server is triggered
	async updateMatch(socket: Socket, data: { match_id: string, command: string, author: string}) {
		console.log(data)
		const match = await this.matchService.updatePositionCurrentMatch(data.match_id, data.author, data.command);
		this.server.to("match#" + data.match_id).emit('update_to_client', match)
		
	}


	afterInit(server: Server) {
		this.logger.log('Init');
	}
	
	async handleConnection(socket: Socket) {
		this.logger.log(`match socket connected: ${socket.id}`);
		if (!socket.handshake.headers.cookie)
			return ;
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

/*
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
import { WsGuard } from '../../guards/websocket.guard';
import { UserService } from '../../user/service/user/user.service';
import { CustomModes, Match, MatchStatus } from '../entity/match.entity';
import { MatchService } from '../service/match.service';
import Player  from '../interface/player.interface'
import Ball from '../interface/ball.interface';

var test;

@WebSocketGateway()
export class MatchGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	socket: Server;

	private logger: Logger = new Logger('MatchGateway');

	constructor(
		private readonly matchService: MatchService,
		private readonly userService: UserService,

	) {}

	@UseGuards(WsGuard)
	@SubscribeMessage('connect_to_match')						// this runs the function when the event msg_to_server is triggered
	async connectToMatch(socket: Socket, data: { opponent_id: string, author: string}) {
		const user = await this.userService.findByUsername(data.author);
		let match: Match = await this.matchService.createMatch({user1_id: user.id.toString(), user2_id: data.opponent_id, mode: CustomModes.NORMAL });
		socket.join("match#" + match.id);
		this.socket.to("match#" + match.id).emit('update_to_client', match)
		setInterval(async () => {
			//match = await this.matchService.updatePositionMatch(match.id);
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
			//match = await this.matchService.updatePositionMatch(match.id);
			this.socket.to("match#" + match.id).emit('update_to_client', match)
		}, 100)
	}




	//@UseGuards(WsGuard)		//-> does not work with this enabled (no username)
	@SubscribeMessage('askConnectionNumber')
	askConnectionNumber(socket: Socket, data: {match_id}) {
		this.socket.emit('sendConnectionNb', 1);		//static test, only master
		//send back the connection number of the client (1, 2, or +)
		//this.socket.to("match#" + data.match_id).emit('sendConnectionNb', ("match#" + data.match_id).length)	-> should send back room length
	}

	//@UseGuards(WsGuard)
	@SubscribeMessage('sendUpdateMatch')
	updateMatch(socket: Socket, data: {match_id: number, player1: Player, player2: Player, ball: Ball}) {
		this.socket.to("match#" + data.match_id).emit('updateMatch', data);						//for everyone
	}

	//@UseGuards(WsGuard)
	@SubscribeMessage('slaveKeyPressed')
	slaveKeyPressed(socket: Socket, data: {match_id: number,  command: number}) {
		this.socket.to("match#" + data.match_id).emit('slaveToMasterKeyPressed', data);			//best if for master only
	}

	//@UseGuards(WsGuard)
	@SubscribeMessage('masterKeyPressed')
	masterKeyPressed(socket: Socket, data: {match_id: number,  command: number}) {
		this.socket.to("match#" + data.match_id).emit('masterToMasterKeyPressed', data);		//best if for master only
	}

	//@UseGuards(WsGuard)
	@SubscribeMessage('readyToStart')
	readyToStart(socket: Socket, data: {match_id: number}) {
		this.socket.to("match#" + data.match_id).emit('readyToStart');							//for everyone
		//if we add clock here, it's not going to be a master clock for all match
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

	handleDisconnect(client: Socket, ...args) {
		this.logger.log(`Client disconnected: ${client.id}`);
		console.log(args)
		// this.socket.to("match#" + data.match_id).emit('playerDisconnect');
	}
}

*/