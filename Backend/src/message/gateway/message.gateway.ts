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
	async handleMessage(socket: CustomSocket, data: { activeChannelId: string, content: string })
	{
		//console.log("// msg_to_server " + data.activeChannelId);

		const username = getUsernameFromSocket(socket);
		const user = await this.userService.findByUsername(username);
		try{
			await this.channelService.checkUserJoinedChannel(username, data.activeChannelId);
			//console.log("user joined the channel", data.content);
			await this.channelService.checkUserRestricted(username, data.activeChannelId);
			//console.log("registering message", data.content);
			const message = await this.chatService.saveMsg(data.content, data.activeChannelId, username);
			//console.log(message);
			if (activeUsers.isActiveUser(+user.id) == true)
			{
				socket.join("channel#" + data.activeChannelId)
			}
			this.server.to("channel#" + data.activeChannelId).emit('msg_to_client', message);
		}
		catch(e){
			//console.log(e.message); // could be nice to emit an error
			this.server.to("user#" + user.id).emit("error_msg");
		}
		return ;
	}

	@SubscribeMessage('connect_to_channel')
	async connectToChannel(socket: CustomSocket, data: { channelId: string })
	{

		// //console.log(socket.request.headers.cookie);

		const username = getUsernameFromSocket(socket);
		//console.log(`// connectToChannel ${username} on ${data.channelId}`);

		// this.channelService.checkUserJoinedChannelWS(username, data.channelId)
		// .catch(()=>{
		// 	//console.log("can not join the channel");
		// })
		// .then(()=>{
		// 	socket.join("channel#" + data.channelId);
		// });

		await this.channelService.checkUserJoinedChannel(username, data.channelId);
		socket.join("channel#" + data.channelId);

		return ;
	}

	@SubscribeMessage('ban')
	async banUser(
		socket: CustomSocket,
		banUserFromChannelDto: BanUserFromChannelDto
	)
	{
		try
		{
			const username = getUsernameFromSocket(socket);

			const bannedUser = await this.channelService.changeBanStatus(
				banUserFromChannelDto.channelId.toString(),
				username,
				banUserFromChannelDto,
				2
			);

			this.server.to("channel#" + banUserFromChannelDto.channelId)
				.emit('ban', {
					channelId: banUserFromChannelDto.channelId,

					user: bannedUser,
				}
			);

			activeUsers.display();
			if (activeUsers.isActiveUser(banUserFromChannelDto.userId) == true)
			{
				const targetedClientSocket = await this.server
					.in(activeUsers.getSocketId(banUserFromChannelDto.userId).socketId)
					.fetchSockets();
				if (targetedClientSocket.length)
				{
					//console.log(`${banUserFromChannelDto.userId} kicked from channel#${banUserFromChannelDto.channelId}`);
					targetedClientSocket[0].leave("channel#" + banUserFromChannelDto.channelId.toString());
					this.server.to("user#" + bannedUser.id)
						.emit('mute', {
							channelId: banUserFromChannelDto.channelId,
							user: bannedUser,
						}
					);
				}
			}
			else
				//console.log(`${banUserFromChannelDto.userId} is not active`);
		}
		catch (e) {
			//console.log(e.message);
			return ;
		}
	}

	@SubscribeMessage('mute')
	async muteUser(
		socket: CustomSocket,
		banUserFromChannelDto: BanUserFromChannelDto)
	{
		const username = getUsernameFromSocket(socket);
		try {
			const bannedUser = await this.channelService.changeBanStatus(
				banUserFromChannelDto.channelId.toString(),
				username,
				banUserFromChannelDto,
				1
			);
			this.server.to("channel#" + banUserFromChannelDto.channelId)
				.emit('mute', {
					channelId: banUserFromChannelDto.channelId,
					user: bannedUser,
				}
			);
			if (activeUsers.isActiveUser(+banUserFromChannelDto.userId) == true)
			{
				this.server.to("user#" + bannedUser.id)
					.emit('mute', {
						channelId: banUserFromChannelDto.channelId,
						user: bannedUser,
					}
				);
			}
			else
				//console.log(`${banUserFromChannelDto.userId} is not active`);
		}
		catch(e)
		{
			//console.log(e.message);
			return ; // an emit could be done to the client room of this socket
		}
		return ;
	}

	@SubscribeMessage('rescue')	// unrestrict ?
	async unbanUser(
		socket: CustomSocket,
		data: { userId: number, channelId: number })
	{
		try {
			const recuedUser = await this.channelService.revertBanStatus(
				data.channelId.toString(),
				getUsernameFromSocket(socket),
				data.userId.toString()
			);
			this.server.to("channel#" + data.channelId)
				.emit('rescue', {
					channelId: data.channelId,
					user: recuedUser,
				}
			);
			// ? emit something on the unbanned room
			if (activeUsers.isActiveUser(+data.userId) == true)
			{
				this.server.to("user#" + recuedUser.id)
					.emit('rescue', {
						channelId: data.channelId,
						user: recuedUser,
					}
				);
			}
			else
				//console.log(`${data.userId} is not active`);
		}
		catch(e)
		{
			//console.log(e.message);
			return ; // an emit could be done to the client room of this socket
		}
		return ;
	}

	@SubscribeMessage('sendInvite')
	async createChannelInvite(socket: CustomSocket, createChannelInviteDto: CreateChannelInviteDto)
	{
		try
		{
			const newInviteDto = await this.channelService.saveInvite(getUsernameFromSocket(socket), createChannelInviteDto);
			//console.log("// newInvite inserted");

			if (activeUsers.isActiveUser(newInviteDto.receiver.id))
			{
				this.server.to("user#" + newInviteDto.receiver.id)
					.emit('new_channel_invite_received', newInviteDto);
			}
			else
				//console.log(`${newInviteDto.receiver.id} in not active`);
		}
		catch (e)
		{
			//console.log("error: " + e.message);
			return { error: e.message };	// todo : an emit could be done to the client room of this socket
		}
	}

	afterInit(server: Server)
	{
		this.logger.log('Init');
	}

	async handleConnection(client: CustomSocket, @Request() req, ...args: any[])
	{
		this.logger.log(`/// ${client.user.username} connected via ${client.id}`);
	}

	handleDisconnect(client: CustomSocket)
	{
		this.logger.log(`${client.user.username} disconected`);
	}
}
