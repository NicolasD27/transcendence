import { HttpCode, Logger, Request, UnauthorizedException } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';
import { activeUsers, CustomSocket } from 'src/auth-socket.adapter';
import { UserService } from 'src/user/service/user.service';
import { FriendshipService } from '../service/friendship.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('ChatGateway');

	constructor(
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
	)
	{}

    @SubscribeMessage('update_friendship')
    async update(
		socket: CustomSocket,
		data: { targetUserId: number, status: number }
	) {

		const username = getUsernameFromSocket(socket);
		const myUser = await this.userService.findByUsername(username);
		await this.friendshipService.update(username, data.targetUserId, data.status);

		this.server.to("user#" + myUser.id)
			.emit('block_successful', { targetUserId: data.targetUserId });

		if (activeUsers.isActiveUser(data.targetUserId) == true)
		{
			this.server.to("user#" + data.targetUserId)
				.emit('blocked_by_another_user', {
					user: myUser.id,
				}
			);
		}
    }

	afterInit(server: Server) {}
	handleConnection(client: CustomSocket) {}
	handleDisconnect(client: CustomSocket) {}

}