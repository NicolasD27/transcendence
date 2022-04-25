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
	@SubscribeMessage('msg_to_server')
	async handleMessage(socket: Socket, data: { activeChannelId: string, content: string }) {

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
				this.socket.to("channel#" + data.activeChannelId).emit('msg_to_client', msgDto);
			})
			.catch(()=>{ return ; });
		})
		.catch(()=>{
			console.log("catch");
			return ;
		})
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('connect_to_channel')
	async connectToChannel(socket: Socket, data: { channelId: string }) {

		// console.log(socket.request.headers.cookie);
		
		const username = getUsernameFromSocket(socket);
		console.log(`// connect_to_channel ${username} on ${data.channelId}`);
		
		if (! await this.channelService.checkUserJoinedChannelWS(username, data.channelId))
		{
			console.log("channel not joined");
			return ;
		}

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
