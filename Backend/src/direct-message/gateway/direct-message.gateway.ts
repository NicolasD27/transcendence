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
import * as session from 'express-session';
import * as passport from 'passport';
import { GetUsername } from '../decorator/get-username.decorator';
import { WsGuard } from '../../guards/websocket.guard';
import { DirectMessageService } from '../service/direct-message.service';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';
import { FriendshipService } from 'src/friendship/service/friendship.service';

@WebSocketGateway()
export class DirectMessageGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	socket: Server;


	constructor(
		private readonly directMessageService: DirectMessageService,
		private readonly friendshipService: FriendshipService,
		// private readonly participationService: ParticipationService,
		) {}

	// @UseGuards(WsGuard)
	@SubscribeMessage('direct_msg_to_server')						// this runs the function when the event msg_to_server is triggered
	async handleMessage(socket: Socket, data: { receiver: string, content: string }) {

		const username = getUsernameFromSocket(socket);
		console.log("// msg_to_server " + data.receiver + " from " + username + " : " + data.content);
		const isFriend = await this.friendshipService.checkFriendship(data.receiver, username);
		if (isFriend)
		{

			const message = await this.directMessageService.saveMsg(data.content, data.receiver, username);
			this.socket.to("user#" + message.sender.id).to("user#" + message.receiver.id).emit('direct_msg_to_client', message);
			console.log(message)
		}
		else
			console.log("failed to send msg...")
	}

	

	

	afterInit(server: Server) {
	}
	
	// @UseGuards(WsGuard)
	async handleConnection(socket: Socket, @Request() req, ...args: any[]) {
	}

	handleDisconnect(client: Socket) {
	}
}
