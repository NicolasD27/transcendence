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
import { CreateMsgDto } from '../dto/create-msg.dto';
import { ChatService } from '../service/message.service';
import * as session from 'express-session';
import * as passport from 'passport';
import { GetUsername } from '../decorator/get-username.decorator';
import { WsGuard } from '../../guards/websocket.guard';
import { Participation } from 'src/channel/entity/participation.entity';
import { ParticipationService } from 'src/channel/service/participation.service';
import { ChannelService } from 'src/channel/service/channel.service';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	socket: Server;

	private logger: Logger = new Logger('ChatGateway');

	constructor(
		private readonly chatService: ChatService,
		private readonly channelService: ChannelService,
		// private readonly participationService: ParticipationService,
		) {}

	@UseGuards(WsGuard)
	@SubscribeMessage('msg_to_server')						// this runs the function when the event msg_to_server is triggered
	async handleMessage(socket: Socket, data: { activeChannelId: string, content: string }) {

		console.log("// msg_to_server " + data.activeChannelId);
		const username = getUsernameFromSocket(socket);
		// * check if the user has joined that channel before
		if (! await this.channelService.checkUserJoinedChannel(username, data.activeChannelId))
			return ;

		const message = await this.chatService.saveMsg(data.content, data.activeChannelId, username);
		const msgDto: CreateMsgDto = {
			content: message.content,
			authorId: message.user.id,
			date: message.date,
		}

		this.socket.to("channel#" + data.activeChannelId).emit('msg_to_client', msgDto);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('connect_to_channel')
	async connectToChannel(socket: Socket, data: { channelId: string }) {

		// // const username = "oui";
		// console.log(socket.request.headers.cookie);


		const username = getUsernameFromSocket(socket);
		console.log(`// connect_to_channel ${username} on ${data.channelId}`);

		if (! await this.channelService.checkUserJoinedChannel(username, data.channelId))
			return ;

		socket.join("channel#" + data.channelId);
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}

	@UseGuards(WsGuard)
	async handleConnection(socket: Socket, @Request() req, ...args: any[]) {
		this.logger.log(`socket connected: ${socket.id}`);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
