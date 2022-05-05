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
import { CreateMsgDto } from '../dto/create-msg.dto';
import { ChatService } from '../service/message.service';
import { ChannelService } from 'src/channel/service/channel.service';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';
import { activeUsers, CustomSocket } from 'src/auth-socket.adapter';
import { BanUserFromChannelDto } from 'src/channel/dto/ban-user-from-channel.dto';
import { CreateChannelInviteDto } from 'src/channel/dto/create-channel-invite.dto';
import { UserService } from 'src/user/service/user.service';
import { ChannelInvite } from 'src/channel/entity/channelInvite.entity';
import { ChannelInviteDto } from 'src/channel/dto/channel-invite.dto';
import { User } from 'src/user/entity/user.entity';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('ChatGateway');

	constructor(
		private readonly chatService: ChatService,
		private readonly channelService: ChannelService,
		private readonly userService: UserService,
		)
	{}

	@SubscribeMessage('msg_to_server')
	async handleMessage(socket: CustomSocket, data: { activeChannelId: string, content: string }) {

		console.log("// msg_to_server " + data.activeChannelId);

		const username = getUsernameFromSocket(socket);
		try{
			await this.channelService.checkUserJoinedChannel(username, data.activeChannelId);
			const message = await this.chatService.saveMsg(data.content, data.activeChannelId, username);
			console.log(message);
			this.server.to("channel#" + data.activeChannelId).emit('msg_to_client', message);
		}
		catch(e){
			console.log(e.message); // could be nice to emit an error
		}
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

	// ! the use of Promises are needed for 'ban', 'mute', 'rescue' and 'invite'
	// !
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
			if (activeUsers.isActiveUser(banUserFromChannelDto.userId))
			{
				this.server.to(activeUsers.getSocketId(banUserFromChannelDto.userId).socketId)
					.emit('new_channel_invite_received', banUserFromChannelDto);
			}
			else
				console.log(`${banUserFromChannelDto.userId} in not active`);
		}
		catch (e) {
			console.log(e.message);
			return ; // an emit could be done to the client room of this socket
		} // todo : try to break it 

		this.server.to("channel#" + banUserFromChannelDto.channelId)
			.emit('ban', {
				channelId: banUserFromChannelDto.channelId,
				userId: banUserFromChannelDto.userId
			}
		);
		return ;
	}

	@SubscribeMessage('mute')
	async muteUser(
		socket: CustomSocket,
		banUserFromChannelDto: BanUserFromChannelDto)
	{
		const username = getUsernameFromSocket(socket);
		try {
		await this.channelService.changeBanStatus(
			banUserFromChannelDto.channelId.toString(),
			username,
			banUserFromChannelDto,
			1);
		}
		catch(e)
		{
			console.log(e.message);
			return ; // an emit could be done to the client room of this socket
		}
		this.server.to("channel#" + banUserFromChannelDto.channelId)
			.emit('mute', {
				channelId: banUserFromChannelDto.channelId,
				userId: banUserFromChannelDto.userId
			}
		);
		return ;
	}

	@SubscribeMessage('rescue')
	async unbanUser(
		socket: CustomSocket,
		data: { userId: string, channelId: string })
	{
		try {
			await this.channelService.revertBanStatus(
				data.channelId,
				getUsernameFromSocket(socket),
				data.userId);
		}
		catch(e)
		{
			console.log(e.message);
			return ; // an emit could be done to the client room of this socket
		}

		this.server.to("channel#" + data.channelId)
			.emit('rescue', {
				channelId: data.channelId,
				userId: data.userId,
			}
		);
		return ;
	}

	@SubscribeMessage('sendInvite')
	async createChannelInvite(socket: CustomSocket, createChannelInviteDto: CreateChannelInviteDto)
	{
		//! check the black list of the receiver to avoid spam

		try
		{
			const newInviteDto = await this.channelService.saveInvite(getUsernameFromSocket(socket), createChannelInviteDto);
			console.log("// newInvite inserted");

			if (activeUsers.isActiveUser(newInviteDto.receiver.id))
			{
				this.server.to(activeUsers.getSocketId(newInviteDto.receiver.id).socketId)
					.emit('new_channel_invite_received', newInviteDto);
			}
			else
				console.log(`${newInviteDto.receiver.id} in not active`);
		}
		catch (e)
		{
			console.log("error: " + e.message);
			return { error: e.message };	// an emit could be done to the client room of this socket
		}
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	async handleConnection(client: CustomSocket, @Request() req, ...args: any[]) {
		this.logger.log(`/// ${client.user.username} connected via ${client.id}`);
	}

	handleDisconnect(client: CustomSocket) {
		this.logger.log(`${client.user.username} disconected`);
	}
}
