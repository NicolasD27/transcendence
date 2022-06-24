import { UseGuards, Logger, Request } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { activeUsers, CustomSocket } from 'src/auth-socket.adapter';
import { FriendshipService } from 'src/friendship/service/friendship.service';
import { getUsernameFromSocket } from '../get-user-ws.function';
import { UserService } from '../service/user.service';
import { UserStatus } from '../utils/user-status';

@WebSocketGateway()
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('UserGateway');

	constructor(
		private readonly userService: UserService,
		private readonly friendshipService: FriendshipService,
	) {}

	@SubscribeMessage('sendStatusUpdate')						// this runs the function when the event msg_to_server is triggered
	async sendStatusUpdate(socket: CustomSocket, data: { newStatus: UserStatus}) {
		console.log("receiving status update")
		const username = getUsernameFromSocket(socket);
		const user = await this.userService.updateStatusByUsername(data.newStatus, username);
		const friends = await this.friendshipService.findAllActiveFriendsByUser(user.id)
		console.log(friends, user)
		friends.forEach((friend) => {
			this.server.to("user#" + friend.id).emit('notifyStatusUpdate', user);
		})
	}

	@SubscribeMessage('sendFriendRequest')						// this runs the function when the event msg_to_server is triggered
	async sendFriendRequest(socket: CustomSocket, data: { user_id: number}) {
		console.log("receiving friend request")
		const username = getUsernameFromSocket(socket);
		const user = await this.userService.findByUsername(username);
		const friendship = await this.friendshipService.create({user1_id: user.id, user2_id: data.user_id})
		this.server.to("user#" + data.user_id).emit('notifyFriendRequest', friendship);
	}

	@SubscribeMessage('acceptFriendRequest')						// this runs the function when the event msg_to_server is triggered
	async acceptFriendRequest(socket: CustomSocket, data: { friendship_id: number}) {
		console.log("accepting friend request")
		const username = getUsernameFromSocket(socket);
		const friendship = await this.friendshipService.update(username, data.friendship_id, 1)
		this.server.to("user#" + friendship.follower.id).emit('notifyFriendRequestAccepted', friendship);
	}


	// @SubscribeMessage('update_to_server')						// this runs the function when the event msg_to_server is triggered
	// async updateMatch(socket: CustomSocket, data: { match_id: string, command: string}) {
	// 	console.log(data)
	// 	const match = await this.matchService.updatePositionCurrentMatch(data.match_id, username, data.command);
	// 	this.socket.to("match#" + data.match_id).emit('update_to_client', match)

	// }


	afterInit(server: Server) {
		this.logger.log('Init');
	}

	async handleConnection(socket: CustomSocket) {
		this.logger.log(`match socket connected: ${socket.id}`);

		const username = getUsernameFromSocket(socket);
		const user = await this.userService.findByUsername(username);
		this.userService.updateStatusByUsername(UserStatus.ONLINE, username)
		socket.join("user#" + user.id);
		this.logger.log(`user #${user.id} connected to his room: `);

	}

	handleDisconnect(client: Socket, ...args) {
		this.logger.log(`Client disconnected: ${client.id}`);
		console.log(args)
		const username = getUsernameFromSocket(client);
		this.userService.updateStatusByUsername(UserStatus.OFFLINE, username)
		// this.socket.to("match#" + data.match_id).emit('playerDisconnect');
		activeUsers.remove(+client.id);
	}
}
