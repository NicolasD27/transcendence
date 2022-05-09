import { Logger } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CustomModes, MatchStatus } from '../entity/match.entity';
import { MatchService } from '../service/match.service';
import Player  from '../interface/player.interface'
import Ball from '../interface/ball.interface';
import Game from '../interface/game.interface'
import { MatchDto } from '../dto/match.dto';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';
import { UserService } from 'src/user/service/user.service';
import { CustomSocket } from 'src/auth-socket.adapter';

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
		@SubscribeMessage('connect_to_match')
		async connectToMatch(socket: CustomSocket, data: { opponent_id: string }) {
				console.log(data)
				const username = getUsernameFromSocket(socket)
				const user = await this.userService.findByUsername(username);
				let match: MatchDto = await this.matchService.createMatch({user1_id: user.id, user2_id: +data.opponent_id, mode: CustomModes.NORMAL });
				socket.join("match#" + match.id);
				match.room_size++;
				this.server.to("match#" + match.id).emit('update_to_client', match)		//changed it from match, the client now only receives the id
																							// which he sends back at every event
		}

		// @UseGuards(WsGuard)
		@SubscribeMessage('find_match')
		async findMatch(socket: CustomSocket) {
				const username = getUsernameFromSocket(socket)
				let match = await this.matchService.matchmaking(username, CustomModes.NORMAL );
				socket.join("match#" + match.id);
				match.room_size++;
				if (match.status == MatchStatus.ACTIVE) {
						this.server.to("match#" + match.id).emit('launch_match', match);
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
				const username = getUsernameFromSocket(socket)
				const user = await this.userService.findByUsername(username);
				let match = await this.matchService.updateMatch(username, data.match_id, {status: MatchStatus.ACTIVE});
				socket.join("match#" + match.id);
				match.room_size++;
				this.server.to("match#" + match.id).emit('launch_match', match)
		}

		/*//@UseGuards(WsGuard)
		@SubscribeMessage('askConnectionNumber')
		async askConnectionNumber(socket: CustomSocket, data: {match_id: string}) {
			console.log("Connection number asked");
			this.server.to("match#" + data.match_id).emit('sendConnectionNb', this.server.sockets.adapter.rooms["match#" + data.match_id].size);
		}*/

		//@UseGuards(WsGuard)
		@SubscribeMessage('sendUpdateMatch')
		async sendUpdateMatch(socket: CustomSocket, data: {match_id: string, game: Game}) {
				this.server.to("match#" + data.match_id).emit('updateMatch', data.game);
		}

        //@UseGuards(WsGuard)
        @SubscribeMessage('readyToStart')
        async readyToStart(socket: CustomSocket, data: {match_id: string}) {
                this.server.to("match#" + data.match_id).emit('askUpdateMatch');
        }

		//@UseGuards(WsGuard)
		@SubscribeMessage('slaveKeyPressed')
		async slaveKeyPressed(socket: CustomSocket, data: {match_id: string,  command: number}) {
			this.server.to("match#" + data.match_id).emit('slaveToMasterKeyPressed', data);
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('masterKeyPressed')
		async masterKeyPressed(socket: CustomSocket, data: {match_id: string,  command: number}) {
				this.server.to("match#" + data.match_id).emit('masterToMasterKeyPressed', data);
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('slaveKeyReleased')
		async slaveKeyReleased(socket: CustomSocket, data: {match_id: string,  command: number}) {
			this.server.to("match#" + data.match_id).emit('slaveToMasterKeyReleased', data);
		}

		//@UseGuards(WsGuard)
		@SubscribeMessage('masterKeyReleased')
		async masterKeyReleased(socket: CustomSocket, data: {match_id: string,  command: number}) {
				this.server.to("match#" + data.match_id).emit('masterToMasterKeyReleased', data);
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
				var id = gameloop.setGameLoop(function()										//to stop the clock (if needed), use this *id*
				{
					server.emit('serverTick');
				}, 1000 / 30);																		//choose refresh rate here
		}

		handleDisconnect(client: CustomSocket, ...args) {
				this.logger.log(`Client disconnected: ${client.id}`);
				console.log(args)
				//recover the match_id from the disconnected user, and send event to this room if user isnt spect
		}
}