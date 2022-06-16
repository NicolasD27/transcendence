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
import { UserStatus } from 'src/user/entity/user.entity';

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
		@SubscribeMessage('find_match')
		async findMatch(socket: CustomSocket, data: {mode: number}) {
			console.log("finding matchs")		//add checks if slave & master != username
			const username = getUsernameFromSocket(socket)
			let match = await this.matchService.matchmaking(username, data.mode );
			socket.join("match#" + match.id);
			match.room_size++;
			this.matchService.updateMatch(username, match.id.toString(), match);
			if (match.status == MatchStatus.ACTIVE)
			{
				console.log("IS ACTIVE")
				this.userService.updateStatusByUsername(UserStatus.PLAYING, match.user1.username);
				this.userService.updateStatusByUsername(UserStatus.PLAYING, match.user2.username);
				activeUsers.updateState(match.user1.id, UserStatus.PLAYING);
				activeUsers.updateState(match.user2.id, UserStatus.PLAYING);
				this.server.to("match#" + match.id).emit('launch_match', match);
				console.log(`matchID = ${match.id}`);
			}
			else
			{
				console.log("waiting for another player");
				this.userService.updateStatusByUsername(UserStatus.SEARCHING, match.user1.username);
				activeUsers.updateState(socket.user.id, UserStatus.SEARCHING);
			}
		}

		// @UseGuards(WsGuard)
		@SubscribeMessage('challenge_user')
		async challengeUser(socket: CustomSocket, data: { opponent_id: string, author: string}) {
			const user = await this.userService.findByUsername(data.author);
			const match: MatchDto = await this.matchService.createMatch({user1_id: user.id, user2_id: +data.opponent_id, mode: CustomModes.NORMAL });
			socket.join("match#" + match.id);
			match.room_size++;
			this.server.to("user#" + data.opponent_id).emit('match_invite_to_client', match)
		}

		// @UseGuards(WsGuard)
		@SubscribeMessage('accept_challenge')
		async acceptMatchInvite(socket: CustomSocket, data: { match_id: string }) {
			console.log("accepting match...")
			const username = getUsernameFromSocket(socket)
			const user = await this.userService.findByUsername(username);
			let match = await this.matchService.updateMatch(username, data.match_id, {status: MatchStatus.ACTIVE});
			socket.join("match#" + match.id);
			match.room_size++;
			this.matchService.updateMatch(username, match.id.toString(), match)
			this.userService.updateStatusByUsername(UserStatus.PLAYING, username);
			activeUsers.updateState(socket.user.id, UserStatus.PLAYING);

			this.server.to("match#" + match.id).emit('launch_match', match)
		}

		@SubscribeMessage('connect_to_match')
		async connectToMatch(socket: CustomSocket, data: {match_id: string}) {
			if (this.matchService.isActive(data.match_id))
			socket.join("match#" + data.match_id);
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('askForMyID')
		async askForMyID(socket: CustomSocket) {
			socket.emit('receiveMyID', getUsernameFromSocket(socket));
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('masterScored')
		async masterScored(socket: CustomSocket, data: {match_id: string}) {
			let match = await this.matchService.findOne(data.match_id);
			match.score1++;
			this.matchService.updateMatch(getUsernameFromSocket(socket), match.id.toString(), match)
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('slaveScored')
		async slaveScored(socket: CustomSocket, data: {match_id: string}) {
			let match = await this.matchService.findOne(data.match_id);
			match.score2++;
			this.matchService.updateMatch(getUsernameFromSocket(socket), match.id.toString(), match)
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('sendUpdateMatch')
		async sendUpdateMatch(socket: CustomSocket, data: {match_id: number, game: Game}) {
			this.server.to("match#" + data.match_id).emit('updateMatch', data.game);
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('slaveKeyPressed')
		async slaveKeyPressed(socket: CustomSocket, data: {match_id: string,  command: number}) {
			this.server.to("match#" + data.match_id).emit('slaveToMasterKeyPressed', data.command);
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('masterKeyPressed')
		async masterKeyPressed(socket: CustomSocket, data: {match_id: string,  command: number}) {
			this.server.to("match#" + data.match_id).emit('masterToMasterKeyPressed', data.command);
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('slaveKeyReleased')
		async slaveKeyReleased(socket: CustomSocket, data: {match_id: string,  command: number}) {
			this.server.to("match#" + data.match_id).emit('slaveToMasterKeyReleased', data.command);
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('masterKeyReleased')
		async masterKeyReleased(socket: CustomSocket, data: {match_id: string,  command: number}) {
			this.server.to("match#" + data.match_id).emit('masterToMasterKeyReleased', data.command);
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('gameFinished')
		async gameFinished(socket: CustomSocket, data: {match_id: string, winner: string, score1: number, score2: number}) {
			this.logger.log("ITS FINISHED")
			let match = await this.matchService.findOne(data.match_id);
			match.status = MatchStatus.FINISHED;
			match.winner = data.winner;

			this.matchService.updateMatch(getUsernameFromSocket(socket), match.id.toString(), match);
			this.userService.updateStatusByUsername(UserStatus.ONLINE, match.user1.username);
			this.userService.updateStatusByUsername(UserStatus.ONLINE, match.user2.username);
			activeUsers.updateState(match.user1.id, UserStatus.ONLINE);
			activeUsers.updateState(match.user2.id, UserStatus.ONLINE);
			this.server.to("match#" + data.match_id).emit('serverGameFinished', data.winner);	//sends back the winner
		}

		//@UseGuards(WsGuard)
		async handleConnection(socket: CustomSocket)
		{
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

		afterInit(server: Server)
		{
			var gameloop = require('node-gameloop');
			var id = gameloop.setGameLoop(function()
			{
				server.emit('serverTick');
			}, 1000 / 60);
		}

		handleDisconnect(client: CustomSocket, ...args) {
			this.logger.log(`Client disconnected: ${client.id}`);
			this.server.emit('clientDisconnect', getUsernameFromSocket(client));
		}
}