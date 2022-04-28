import { UseGuards, Logger, Request, Req } from '@nestjs/common';
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
import { WsGuard } from '../../guards/websocket.guard';
import { ChannelService } from 'src/channel/service/channel.service';
import { getUsernameFromSocket } from 'src/user/get-user-ws.function';
import { activeUsers, CustomSocket } from 'src/auth-socket.adapter';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer()
	server: Server;

	private logger: Logger = new Logger('ChatGateway');

	constructor(
		private readonly chatService: ChatService,
		private readonly channelService: ChannelService,
		// private readonly participationService: ParticipationService,
		) {}

	// @UseGuards(WsGuard)
	@SubscribeMessage('msg_to_server')
	async handleMessage(socket: CustomSocket, data: { activeChannelId: string, content: string }) {

		console.log("// msg_to_server " + data.activeChannelId);

		const username = getUsernameFromSocket(socket);
		await this.channelService.checkUserJoinedChannelWS(username, data.activeChannelId)
		.then(()=>{
			console.log("then");
			this.chatService.saveMsg(data.content, data.activeChannelId, username)
			.then((message)=>{
				const msgDto: CreateMsgDto = {
					content: message.content,
					authorId: message.user.id,
					date: message.date,
				}
				this.server.to("channel#" + data.activeChannelId).emit('msg_to_client', msgDto);
			})
			.catch(()=>{ return ; });                                           
		})
		.catch(()=>{
			console.log("catch");
			return ;
		});
	}

	// @UseGuards(WsGuard)
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

	}

	@SubscribeMessage('leave')
	async pepoLeave(socket: CustomSocket, data: { channelId: string }) {
		// activeUsers.remove(socket.user.id);

		const findMyUser = await this.server
			.in(activeUsers.getSocketId(socket.user.id).socketId)
			.fetchSockets();
		if (findMyUser.length)
		{
			console.log(`${socket.user.username} left ${data.channelId}`);
			findMyUser[0].leave(String(data.channelId));
		}
	}

	afterInit(server: Server) {
		this.logger.log('Init');
	}
	
	// @UseGuards(WsGuard)
	async handleConnection(socket: CustomSocket, @Request() req, ...args: any[]) {
		this.logger.log(`socket connected: ${socket.id}`);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}
}
