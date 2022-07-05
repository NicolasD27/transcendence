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
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';
import { activeUsers, CustomSocket } from 'src/auth-socket.adapter';
import { UserService } from 'src/user/service/user.service';
import { FriendshipService } from '../service/friendship.service';
import { FriendshipStatus } from '../entity/friendship.entity';

@WebSocketGateway()
export class FriendshipGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('FriendshipGateway');

	constructor(
		private readonly friendshipService: FriendshipService,
		private readonly userService: UserService,
	)
	{}

    @SubscribeMessage('update_friendship_state')
    async update(
		socket: CustomSocket,
		data: { receiver: number, status: number }
	) {
		const username = getUsernameFromSocket(socket);
		const myUser = await this.userService.findByUsername(username);
		try {
			const myFriendship = await this.friendshipService.findOne(myUser.id, data.receiver);
			if (data.status == FriendshipStatus.ACTIVE)
				data.status;
			else if (myFriendship.follower.id == data.receiver)
				data.status = FriendshipStatus.BLOCKED_BY_FOLLOWING;
			else
				data.status = FriendshipStatus.BLOCKED_BY_FOLLOWER;
			await this.friendshipService.update(username, myFriendship.id, data.status); // todo fix it

			this.server.to("user#" + myUser.id)
				.emit('friendship_state_updated', {
					updater: myUser.id,
					receiver: data.receiver,
					status: data.status,
					state: 1
				}
			);
			if (activeUsers.isActiveUser(data.receiver) == true)
			{
				this.server.to("user#" + data.receiver)
					.emit('friendship_state_updated', {
						updater: myUser.id,
						receiver: data.receiver,
						status: data.status,
						state: 1
					}
				);
			}
			//this.server.emit('refreshFriendList');
		}
		catch(e)
		{
			this.server.to("user#" + myUser.id)
				.emit('friendship_state_updated', {
					state: 0,
				});
		}
	}

	afterInit(server: Server) {}
	handleConnection(client: CustomSocket) {}
	handleDisconnect(client: CustomSocket) {}

}