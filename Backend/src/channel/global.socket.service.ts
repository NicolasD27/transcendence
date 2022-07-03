import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class GlobalSocketService {
	public socket: Server = null;

	channelDeleted(channelId: number)
	{
		this.socket.emit("channelDeleted", { channelId: channelId });
		return ;
	}
}
