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
import { FriendshipService } from 'src/friendship/service/friendship.service';
import { WsGuard } from '../../guards/websocket.guard';
import { UserStatus } from '../entity/user.entity';
import { UserService } from '../service/user.service';

@WebSocketGateway()
export class UserGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('UserGateway');

	constructor(
		private readonly userService: UserService,
		private readonly friendshipService: FriendshipService,
		
	) {}

	

	@UseGuards(WsGuard)
	@SubscribeMessage('sendStatusUpdate')						// this runs the function when the event msg_to_server is triggered
	async sendStatusUpdate(socket: Socket, data: { newStatus: UserStatus, author: string}) {
		console.log("receiving status update")
		const user = await this.userService.updateStatusByUsername(data.newStatus, data.author);		
		const friends = await this.friendshipService.findAllActiveFriendsByUser(user.id)
		console.log(friends, user)
		friends.forEach((friend) => {
			this.server.to("users#" + friend.id).emit('notifyStatusUpdate', user);
		})	
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('sendFriendRequest')						// this runs the function when the event msg_to_server is triggered
	async sendFriendRequest(socket: Socket, data: { user_id: number, author: string}) {
		console.log("receiving friend request")
		const user = await this.userService.findByUsername(data.author);		
		const friendship = await this.friendshipService.create({user1_id: user.id, user2_id: data.user_id})
		this.server.to("users#" + data.user_id).emit('notifyFriendRequest', friendship);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('acceptFriendRequest')						// this runs the function when the event msg_to_server is triggered
	async acceptFriendRequest(socket: Socket, data: { friendship_id: number, author: string}) {
		console.log("accepting friend request")
		const friendship = await this.friendshipService.update(data.author, data.friendship_id, 1)
		this.server.to("users#" + friendship.following.id).emit('notifyFriendRequestAccepted', friendship);
	}


	// @UseGuards(WsGuard)
	// @SubscribeMessage('update_to_server')						// this runs the function when the event msg_to_server is triggered
	// async updateMatch(socket: Socket, data: { match_id: string, command: string, author: string}) {
	// 	console.log(data)
	// 	const match = await this.matchService.updatePositionCurrentMatch(data.match_id, data.author, data.command);
	// 	this.socket.to("match#" + data.match_id).emit('update_to_client', match)
		
	// }


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
