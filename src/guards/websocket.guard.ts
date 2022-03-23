import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from 'src/user/service/user/user.service';
import { Observable } from 'rxjs';

import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { User } from 'src/user/entity/user.entity';

// @Injectable()
// export class WsJwtGuard implements CanActivate {
//   private logger: Logger = new Logger(WsJwtGuard.name);

//   constructor(private authService: AuthService) { }

//   async canActivate(context: ExecutionContext): Promise<boolean> {

//     // try {
//       const client: Socket = context.switchToWs().getClient<Socket>();
//       const authToken: string = client.handshake?.query?.token;

// 		const user: User = await this.authService.verifyUser(authToken);
// 		client.join(`house_${user?.house?.id}`);
// 		context.switchToHttp().getRequest().user = user

// 		return Boolean(user);
// 	} catch (err) {
// 		throw new WsException(err.message);
// 	}
// }
// 	return true;
// }


// @Injectable()
// export class WebsocketGuard extends AuthGuard('42') {
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const activate: boolean = (await super.canActivate(context)) as boolean;
//     const request: Request = context.switchToWs().
//     await super.logIn(request);
//     return activate;
//   }
// }

// const client: Socket = context.switchToWs().getClient();
// const sessionCookie = this.client.handshake.headers.cookie
// .split('; ')
// .find((cookie: string) => cookie.startsWith('session'))
// .split('=')[1];

// const sessionId = cookieParser.signedCookie(
// decodeURIComponent(sessionCookie),
// process.env.CryptoKey,
// );

// console.log('SESSION ID',sessionId);
// }

// @Injectable()
// export class WsGuard implements CanActivate {

// 	constructor(private userService: UserService) {
// 	}

// 	canActivate(
// 		context: any,
// 	): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
// 		const bearerToken = context.args[0].handshake.headers.authorization.split(' ')[1];
// 		try {
// 			const decoded = jwt.verify(bearerToken, jwtConstants.secret) as any;
// 			return new Promise((resolve, reject) => {
// 				return this.userService.findByUsername(decoded.username).then(user => {
// 					if (user) {
// 						resolve(user);
// 					} else {
// 						reject(false);
// 					}
// 				});

// 			});
// 		} catch (ex) {
// 			console.log(ex);
// 			return false;
// 		}
// 	}
// }