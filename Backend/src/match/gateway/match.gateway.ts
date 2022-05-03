import { UseGuards, Logger, Request, Req } from '@nestjs/common';
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
import { MatchDto } from '../dto/match.dto';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';
import { UserService } from 'src/user/service/user.service';
import { WsGuard } from '../../guards/websocket.guard';

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
        @SubscribeMessage('connect_to_match')                                           // this runs the function when the event msg_to_server is triggered
        async connectToMatch(socket: Socket, data: { opponent_id: string }) {
                console.log(data)
                const username = getUsernameFromSocket(socket)
                const user = await this.userService.findByUsername(username);
                let match: MatchDto = await this.matchService.createMatch({user1_id: user.id, user2_id: +data.opponent_id, mode: CustomModes.NORMAL });
                socket.join("match#" + match.id);
                this.server.to("match#" + match.id).emit('update_to_client', match)


        }

        // @UseGuards(WsGuard)
        @SubscribeMessage('find_match')                                         // this runs the function when the event msg_to_server is triggered
        async findMatch(socket: Socket) {
                const username = getUsernameFromSocket(socket)
                let match = await this.matchService.matchmaking(username, CustomModes.NORMAL );
                socket.join("match#" + match.id);
                if (match.status == MatchStatus.ACTIVE) {
                        this.server.to("match#" + match.id).emit('launch_match', match)

                }
        }

        // @UseGuards(WsGuard)
        @SubscribeMessage('challenge_user')                                             // this runs the function when the event msg_to_server is triggered
        async challengeUser(socket: Socket, data: { opponent_id: string, author: string}) {
                const user = await this.userService.findByUsername(data.author);
                const match: MatchDto = await this.matchService.createMatch({user1_id: user.id, user2_id: +data.opponent_id, mode: CustomModes.NORMAL });
                socket.join("match#" + match.id);
                console.log("match : ", match)
                this.server.to("user#" + data.opponent_id).emit('match_invite_to_client', match)
        }

        // @UseGuards(WsGuard)
        @SubscribeMessage('accept_challenge')                                           // this runs the function when the event msg_to_server is triggered
        async acceptMatchInvite(socket: Socket, data: { match_id: string }) {
                const username = getUsernameFromSocket(socket)
                const user = await this.userService.findByUsername(username);
                let match = await this.matchService.updateMatch(username, data.match_id, {status: MatchStatus.ACTIVE});
                socket.join("match#" + match.id);

                this.server.to("match#" + match.id).emit('launch_match', match)

        }

        //@UseGuards(WsGuard)
        @SubscribeMessage('askConnectionNumber')
        async askConnectionNumber(socket: Socket, data: {match_id: number, player1: Player, player2: Player, ball: Ball}) {
                this.server.to("match#" + data.match_id).emit('sendConnectionNb', 1);                                   //change this with the room size
        }

        //@UseGuards(WsGuard)
        @SubscribeMessage('sendUpdateMatch')
        async sendUpdateMatch(socket: Socket, data: {match_id: number, player1: Player, player2: Player, ball: Ball}) {
                this.server.to("match#" + data.match_id).emit('updateMatch', data);
        }

        //@UseGuards(WsGuard)
        @SubscribeMessage('askForUpdate')
        async askForUpdate(socket: Socket, data: {match_id: number, player1: Player, player2: Player, ball: Ball}) {
                this.server.to("match#" + data.match_id).emit('askUpdateMatch');
        }

        //@UseGuards(WsGuard)
        @SubscribeMessage('slaveKeyPressed')
        async slaveKeyPressed(socket: Socket, data: {match_id: number,  command: number}) {
                this.server.to("match#" + data.match_id).emit('slaveToMasterKeyPressed', data);
        }

        //@UseGuards(WsGuard)
        @SubscribeMessage('masterKeyPressed')
        async masterKeyPressed(socket: Socket, data: {match_id: number,  command: number}) {
                this.server.to("match#" + data.match_id).emit('masterToMasterKeyPressed', data);
        }

        //@UseGuards(WsGuard)
        async handleConnection(socket: Socket)
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
                var id = gameloop.setGameLoop(function(delta)                                                           //to stop the clock (if needed), use this *id*
                {
                        server.emit('serverTick');
                }, 1000 / 30);                                                                                                                          //choose refresh rate here
        }

        handleDisconnect(client: Socket, ...args) {
                this.logger.log(`Client disconnected: ${client.id}`);
                console.log(args)
                // this.server.to("match#" + data.match_id).emit('playerDisconnect'); ---> send info to others clients for disconnect
        }
}