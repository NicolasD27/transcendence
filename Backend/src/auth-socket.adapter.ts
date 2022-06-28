import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket } from 'socket.io';
import { UserDto } from './user/dto/user.dto';
import { ActiveUsers } from './user/entity/active-user';
import { User } from './user/entity/user.entity';
import { UserService } from './user/service/user.service';

export interface CustomSocket extends Socket {
	user: UserDto;
}	

const activeUsers = new ActiveUsers();

export class AuthSocketAdapter extends IoAdapter {

	private readonly jwtService: JwtService;
	private readonly userService: UserService;

	constructor(private app: INestApplicationContext) {
		super(app);
		this.jwtService = this.app.get(JwtService);
		this.userService = this.app.get(UserService);
	}

	createIOServer(port: number, options?: ServerOptions): any {

		//console.log("##### createIOServer #######");
		const server = super.createIOServer(port); // , { cors: true }
		server.use((socket: CustomSocket, next: any) => {
			let decoded;
			try
			{
				const accessToken = socket.handshake.headers.cookie
				.split('; ')
				.find((cookie: string) => cookie.startsWith('accessToken'))
				.split('=')[1];
				const username = socket.handshake.headers.cookie
				.split('; ')
				.find((cookie: string) => cookie.startsWith('username'))
				.split('=')[1];
				decoded = this.jwtService.verify(accessToken) as any;
				if (decoded)
				{
					if (decoded.username != username)
						next (new Error("Unauthorized !"));
					this.userService.findByUsername(decoded.username)
					.then((myUser)=>{
						socket.user = myUser;
						//console.log(myUser);
						activeUsers.add(socket.user.id, socket.id);
						next();
					})
					.catch(()=>{
						next (new Error("Unauthorized !"));
					})
				}
				else
				{
					next (new Error("Unauthorized !"));
				}
			}
			catch (error)
			{
				next (new Error("Unauthorized !"));
			}
		});
		return server;
	}
}

export { activeUsers }