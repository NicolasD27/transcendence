import { Logger, Request, UnauthorizedException } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CreateMsgDto } from '../dto/create-msg.dto';
import { ChatService } from '../service/message.service';
import { ChannelService } from 'src/channel/service/channel.service';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';
import { activeUsers, CustomSocket } from 'src/auth-socket.adapter';
import { BanUserFromChannelDto } from 'src/channel/dto/ban-user-from-channel.dto';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('ChatGateway');

	constructor(
		private readonly chatService: ChatService,
		private readonly channelService: ChannelService,
		)
	{}

	@SubscribeMessage('msg_to_server')
	async handleMessage(socket: CustomSocket, data: { activeChannelId: string, content: string }) {

		console.log("// msg_to_server " + data.activeChannelId);

		const username = getUsernameFromSocket(socket);
		await this.channelService.checkUserJoinedChannelWS(username, data.activeChannelId)
		.then(()=>{
			this.chatService.saveMsg(data.content, data.activeChannelId, username)
			.then((message)=>{
				this.server.to("channel#" + data.activeChannelId).emit('msg_to_client', message);
			})
			.catch(()=>{ return ; });
		})
		.catch(()=>{
			console.log("checkUserJoinedChannelWS failed");
			return ;
		});
		return ;
	}

	@SubscribeMessage('connect_to_channel')
	async connectToChannel(socket: CustomSocket, data: { channelId: string }) {

		// console.log(socket.request.headers.cookie);

		const username = getUsernameFromSocket(socket);
		console.log(`// connectToChannel ${username} on ${data.channelId}`);

		this.channelService.checkUserJoinedChannelWS(username, data.channelId)
		.catch(()=>{
			console.log("channel not joined");
		})
		.then(()=>{
			socket.join("channel#" + data.channelId);
		});
		return ;
	}

	@SubscribeMessage('leave')
	async pepoLeave(socket: CustomSocket, data: { channelId: string }) {
		// activeUsers.remove(socket.user.id);

		const myClientSocket = await this.server
			.in(activeUsers.getSocketId(socket.user.id).socketId)
			.fetchSockets();
		if (myClientSocket.length)
		{
			console.log(`${socket.user.username} left ${data.channelId}`);
			myClientSocket[0].leave("channel#" + data.channelId);
		}
		return ;
	}

	// ! the use of Promises are needed for 'ban', 'mute' and 'rescue'
	// !
	// !

	@SubscribeMessage('ban')
	async banUser(
		socket: CustomSocket,
		banUserFromChannelDto: BanUserFromChannelDto)
	{
		const username = getUsernameFromSocket(socket);
		await this.channelService.changeBanStatus(
			banUserFromChannelDto.channelId.toString(),
			username,
			banUserFromChannelDto,
			2);

		try {
			const targetedClientSocket = await this.server
			.in(activeUsers.getSocketId(banUserFromChannelDto.userId).socketId)
			.fetchSockets();
			if (targetedClientSocket.length)
			{
				console.log(`${banUserFromChannelDto.userId} kicked from ${banUserFromChannelDto.channelId}`);
				targetedClientSocket[0].leave("channel#" + banUserFromChannelDto.channelId.toString());
			}
		}
		catch {} // todo : try to break it

		const channel_id	= banUserFromChannelDto.channelId;
		const user_id		= banUserFromChannelDto.userId;

		this.server.to("channel#" + banUserFromChannelDto.channelId)
			.emit('ban', { channel_id, user_id});
		return ;
	}

	@SubscribeMessage('mute')
	async muteUser(
		socket: CustomSocket,
		banUserFromChannelDto: BanUserFromChannelDto)
	{
		const username = getUsernameFromSocket(socket);
		await this.channelService.changeBanStatus(
			banUserFromChannelDto.channelId.toString(),
			username,
			banUserFromChannelDto,
			1);

		const channel_id	= banUserFromChannelDto.channelId;
		const user_id		= banUserFromChannelDto.userId;

		this.server.to("channel#" + banUserFromChannelDto.channelId)
			.emit('mute', { channel_id, user_id});
		return ;
	}

	@SubscribeMessage('rescue')
	async unbanUser(
		socket: CustomSocket,
		data: { userId: string, channelId: string })
	{
		await this.channelService.revertBanStatus(
			data.channelId,
			getUsernameFromSocket(socket),
			data.userId);

		const channel_id = data.channelId;
		const user_id = data.userId;

		this.server.to("channel#" + data.channelId)
			.emit('rescue', { channel_id, user_id});
		return ;
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	async handleConnection(client: CustomSocket, @Request() req, ...args: any[]) {
		this.logger.log(`${client.user.username} connected via ${client.id}`);
	}

	handleDisconnect(client: CustomSocket) {
		this.logger.log(`${client.user.username} disconected`);
	}
}
