import { Logger } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { CustomModes, MatchStatus } from '../entity/match.entity';
import { MatchService } from '../service/match.service';
import Game from '../interface/game.interface'
import { MatchDto } from '../dto/match.dto';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';
import { UserService } from 'src/user/service/user.service';
import { activeUsers, CustomSocket } from 'src/auth-socket.adapter';
import { UserStatus } from 'src/user/utils/user-status';
import { FriendshipService } from 'src/friendship/service/friendship.service';

@WebSocketGateway()
export class MatchGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('MatchGateway');

	constructor(
		private readonly matchService: MatchService,
		private readonly userService: UserService,
		private readonly friendshipService: FriendshipService,
	) { }

	@SubscribeMessage('find_match')
	async findMatch(socket: CustomSocket, data: { mode: number }) {
		const username = getUsernameFromSocket(socket)
		let match = await this.matchService.matchmaking(username, data.mode);
		socket.join("match#" + match.id);
		match.room_size++;
		if (match.status == MatchStatus.ACTIVE)
		{
			activeUsers.updateState(match.user1.id, UserStatus.PLAYING);
			activeUsers.updateState(match.user2.id, UserStatus.PLAYING);
			this.server.to("match#" + match.id).emit('launch_match', match);
		}
		else
			activeUsers.updateState(socket.user.id, UserStatus.SEARCHING);
		this.server.emit('refreshFriendList');
	}

	@SubscribeMessage('challenge_user')
	async challengeUser(socket: CustomSocket, data: { opponent_id: string }) {
		const username = getUsernameFromSocket(socket)

		const user1 = await this.userService.findByUsername(username);
		const user2 = await this.userService.findOne(data.opponent_id);
		
		const an_invite_is_still_waiting = await this.matchService.check_match_invite_already_sent(user1, user2);
		if (an_invite_is_still_waiting)
			return ;
		const match: MatchDto = await this.matchService.createMatch({ user1_id: user1.id, user2_id: +data.opponent_id, mode: CustomModes.NORMAL });
    
		socket.join("match#" + match.id);
		match.room_size++;
		this.server.to("user#" + data.opponent_id).emit('match_invite_to_client', match);
	}

	@SubscribeMessage('accept_challenge')
	async acceptMatchInvite(socket: CustomSocket, data: { match_id: string }) {
		const username = getUsernameFromSocket(socket)
		const user_accepting = await this.userService.findByUsername(username);

		const myMatch = await this.matchService.findOne(data.match_id);

		const user_inviting = await this.userService.findOne(myMatch.user1.id.toString());

		if (await this.matchService.check_user_in_match(user_accepting)
			|| await this.matchService.check_user_in_match(user_inviting))
			return ;
		if (!activeUsers.isActiveUser(user_accepting.id)
			|| !activeUsers.isActiveUser(user_inviting.id))
			return ;

		let match = await this.matchService.acceptChallenge(username, data.match_id);
		socket.join("match#" + match.id);
		match.room_size++;
		activeUsers.updateState(match.user1.id, UserStatus.PLAYING);
		activeUsers.updateState(match.user2.id, UserStatus.PLAYING);

		this.server.to('user#' + match.user1.id).emit('nav_to_mainpage')
		this.server.to("match#" + match.id).emit('launch_match', match)
		this.server.emit('refreshFriendList');
	}

	@SubscribeMessage('connect_to_match')
	async connectToMatch(socket: CustomSocket, data: { match_id: string }) {
		if (await this.matchService.isActive(data.match_id))
			socket.join("match#" + data.match_id);
		else
			socket.emit('resetValues')
	}

	@SubscribeMessage('askForReload')
	async askForReload(socket: CustomSocket, data: { match_id: string }) {
		if (data.match_id != null && data.match_id != "-1")
			socket.leave("match#" + data.match_id);
		socket.emit('resetValues');
	}

	@SubscribeMessage('askForMyID')
	async askForMyID(socket: CustomSocket) {
		socket.emit('receiveMyID', getUsernameFromSocket(socket));
	}

	@SubscribeMessage('masterScored')
	async masterScored(socket: CustomSocket, data: { match_id: string }) {
		let match = await this.matchService.findOne(data.match_id);
		match.score1++;
		this.matchService.updateScore(getUsernameFromSocket(socket), match.id.toString(), { score1: match.score1, score2: match.score2 })
	}

	@SubscribeMessage('slaveScored')
	async slaveScored(socket: CustomSocket, data: { match_id: string }) {
		let match = await this.matchService.findOne(data.match_id);
		match.score2++;
		this.matchService.updateScore(getUsernameFromSocket(socket), match.id.toString(), { score1: match.score1, score2: match.score2 })
	}
	
	@SubscribeMessage('askForRefreshFriendList')
	async asfkForRefreshFriendList(socket: CustomSocket) {
		// console.log("Call to refresh")
		this.server.emit('refreshFriendList');
	}

	@SubscribeMessage('sendUpdateMatch')
	async sendUpdateMatch(socket: CustomSocket, data: { match_id: number, game: Game }) {
		this.server.to("match#" + data.match_id).emit('updateMatch', data.game);
	}

	@SubscribeMessage('slaveKeyPressed')
	async slaveKeyPressed(socket: CustomSocket, data: { match_id: string, command: number }) {
		this.server.to("match#" + data.match_id).emit('slaveToMasterKeyPressed', data.command);
	}

	@SubscribeMessage('masterKeyPressed')
	async masterKeyPressed(socket: CustomSocket, data: { match_id: string, command: number }) {
		this.server.to("match#" + data.match_id).emit('masterToMasterKeyPressed', data.command);
	}

	@SubscribeMessage('slaveKeyReleased')
	async slaveKeyReleased(socket: CustomSocket, data: { match_id: string, command: number }) {
		this.server.to("match#" + data.match_id).emit('slaveToMasterKeyReleased', data.command);
	}

	@SubscribeMessage('masterKeyReleased')
	async masterKeyReleased(socket: CustomSocket, data: { match_id: string, command: number }) {
		this.server.to("match#" + data.match_id).emit('masterToMasterKeyReleased', data.command);
	}

	@SubscribeMessage('gameFinished')
	async gameFinished(socket: CustomSocket, data: { match_id: string, winner: string, score1: number, score2: number }) {
		this.logger.log("ITS FINISHED")
		let match = await this.matchService.findOne(data.match_id);
		this.matchService.matchIsFinished(getUsernameFromSocket(socket), match.id.toString(), { status: MatchStatus.FINISHED, winner: data.winner });
		activeUsers.updateState(match.user1.id, UserStatus.ONLINE);
		activeUsers.updateState(match.user2.id, UserStatus.ONLINE);
		this.server.to("match#" + data.match_id).emit('serverGameFinished', data.winner);
		this.server.emit('refreshFriendList');
	}

	async handleConnection(socket: CustomSocket) {
		this.logger.log(`match socket connected: ${socket.id}`);
		if (!socket.handshake.headers.cookie)
			return;
		const cookies = socket.handshake.headers.cookie.split('; ')
		if (cookies.find((cookie: string) => cookie.startsWith('username'))) {
			const username = cookies.find((cookie: string) => cookie.startsWith('username')).split('=')[1];
			const user = await this.userService.findByUsername(username);
			socket.join("user#" + user.id);
		}
		this.server.emit('refreshFriendList');
	}

	afterInit(server: Server) {
		var gameloop = require('node-gameloop');
		var id = gameloop.setGameLoop(function () {
			server.emit('serverTick');
		}, 1000 / 60);
	}

	handleDisconnect(client: CustomSocket, ...args) {
		this.logger.log(`Client disconnected: ${client.id}`);
		this.server.emit('clientDisconnect', getUsernameFromSocket(client));
		this.server.emit('refreshFriendList'); //mettre en rouge
	}
}