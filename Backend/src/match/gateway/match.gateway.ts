import { UseGuards, Logger, Request, UnauthorizedException } from '@nestjs/common';
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
import { UserService } from '../../user/service/user.service';
import { CustomModes, Match, MatchStatus } from '../entity/match.entity';
import { MatchService } from '../service/match.service';
import Player  from '../interface/player.interface'
import Ball from '../interface/ball.interface';
import { MatchDto } from '../dto/match.dto';
import { TwoFactorGuard } from '../../guards/two-factor.guard';
import { GetUsernameWS } from 'src/user/decorator/get-username-ws.decorator';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';

@WebSocketGateway()
export class MatchGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('MatchGateway');

	constructor(
		private readonly matchService: MatchService,
		private readonly userService: UserService,

	) {}



	// @UseGuards(WsGuard)
	@SubscribeMessage('connect_to_match')						// this runs the function when the event msg_to_server is triggered
	async connectToMatch(socket: Socket, data: { opponent_id: string }) {
		console.log(data)
		const username = getUsernameFromSocket(socket)
		const user = await this.userService.findByUsername(username);
		let match: MatchDto = await this.matchService.createMatch({user1_id: user.id, user2_id: +data.opponent_id, mode: CustomModes.NORMAL });
		socket.join("match#" + match.id);
		this.server.to("match#" + match.id).emit('update_to_client', match)


	}


	// @UseGuards(WsGuard)
	@SubscribeMessage('find_match')						// this runs the function when the event msg_to_server is triggered
	async findMatch(socket: Socket) {
		const username = getUsernameFromSocket(socket)
		let match = await this.matchService.matchmaking(username, CustomModes.NORMAL );
		socket.join("match#" + match.id);
		if (match.status == MatchStatus.ACTIVE) {
			this.server.to("match#" + match.id).emit('launch_match', match)

		}
	}

	@SubscribeMessage('askConnectionNumber')
	async askConnectionNumber(socket: Socket, data: {match_id: number, player1: Player, player2: Player, ball: Ball}) {
		console.log("this is a test");
		this.server.to("match#" + data.match_id).emit('askConnectionNumber', 1);
	}

	// @UseGuards(WsGuard)
	@SubscribeMessage('sendUpdateMatch')
	async sendUpdateMatch(socket: Socket, data: {match_id: number, player1: Player, player2: Player, ball: Ball}) {
		this.server.to("match#" + data.match_id).emit('updateMatch', data);
	}

	// @UseGuards(WsGuard)
	@SubscribeMessage('askForUpdate')
	async askForUpdate(socket: Socket, data: {match_id: number, player1: Player, player2: Player, ball: Ball}) {
		this.server.to("match#" + data.match_id).emit('askUpdateMatch');
	}


	// @UseGuards(WsGuard)
	@SubscribeMessage('slaveKeyPressed')
	async slaveKeyPressed(socket: Socket, data: {match_id: number,  command: number}) {
		this.server.to("match#" + data.match_id).emit('slaveToMasterKeyPressed', data);
	}

	// @UseGuards(WsGuard)
	@SubscribeMessage('masterKeyPressed')
	async masterKeyPressed(socket: Socket, data: {match_id: number,  command: number}) {
		this.server.to("match#" + data.match_id).emit('masterToMasterKeyPressed', data);
	}


	// @UseGuards(WsGuard)
	@SubscribeMessage('challenge_user')						// this runs the function when the event msg_to_server is triggered
	async challengeUser(socket: Socket, data: { opponent_id: string, author: string}) {
		const user = await this.userService.findByUsername(data.author);
		const match: MatchDto = await this.matchService.createMatch({user1_id: user.id, user2_id: +data.opponent_id, mode: CustomModes.NORMAL });
		socket.join("match#" + match.id);
		console.log("match : ", match)
		this.server.to("user#" + data.opponent_id).emit('match_invite_to_client', match)
	}

	// @UseGuards(WsGuard)
	@SubscribeMessage('accept_challenge')						// this runs the function when the event msg_to_server is triggered
	async acceptMatchInvite(socket: Socket, data: { match_id: string }) {
		const username = getUsernameFromSocket(socket)
		const user = await this.userService.findByUsername(username);
		let match = await this.matchService.updateMatch(username, data.match_id, {status: MatchStatus.ACTIVE});
		socket.join("match#" + match.id);

		this.server.to("match#" + match.id).emit('launch_match', match)

	}


	// @UseGuards(WsGuard)
	// @SubscribeMessage('update_to_server')						// this runs the function when the event msg_to_server is triggered
	// async updateMatch(socket: Socket, data: { match_id: string, command: string }) {
	// 	console.log(data)
	// 	const match = await this.matchService.updatePositionCurrentMatch(data.match_id, data.author, data.command);
	// 	this.server.to("match#" + data.match_id).emit('update_to_client', match)

	// }


	afterInit(server: Server) {
		this.logger.log('Init');
	}

	// @UseGuards(TwoFactorGuard)
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

	handleDisconnect(client: Socket, ...args) {
		this.logger.log(`Client disconnected: ${client.id}`);
		console.log(args)
		// this.server.to("match#" + data.match_id).emit('playerDisconnect');
	}
}


