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
		await this.channelService.changeBanStatus(
			banUserFromChannelDto.channelId.toString(),
			username,
			banUserFromChannelDto,
			1);

		const channel_id	= banUserFromChannelDto.channelId;
		const user_id		= banUserFromChannelDto.userId;

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
		await this.channelService.revertBanStatus(
			data.channelId,
			getUsernameFromSocket(socket),
			data.userId);

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
			console.log("error: " + e);
			return { error: e.message };
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
