import { Module, Global } from '@nestjs/common';
import { GlobalSocketService } from './global.socket.service';

@Global()
@Module({
	controllers: [],
	providers: [GlobalSocketService],
	exports: [GlobalSocketService],
})
export class SocketModule {}