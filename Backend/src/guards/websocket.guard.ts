import { Observable } from 'rxjs';

import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../user/service/auth.service';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class WsGuard implements CanActivate {

	constructor(private userService: UserService,
		private jwtService: JwtService,
		private authService: AuthService
		) {
	}

	canActivate(
		context: ExecutionContext,
	): boolean | any | Promise<boolean | any> | Observable<boolean | any> {

		let accessToken;
		let username;
		const cookie_string = context.switchToWs().getClient().handshake.headers.cookie
		if (!cookie_string)
			throw new UnauthorizedException("No cookie");
		const cookies = cookie_string.split('; ')
		if (cookies.find((cookie: string) => cookie.startsWith('username')))
			username = cookies.find((cookie: string) => cookie.startsWith('username')).split('=')[1];
		else
			throw new UnauthorizedException("No username");
		if (cookies.find((cookie: string) => cookie.startsWith('accessToken')))
			accessToken = cookies.find((cookie: string) => cookie.startsWith('accessToken')).split('=')[1];
		else
			throw new UnauthorizedException("No accessToken");
		try {
			const decoded = this.jwtService.verify(accessToken) as any;
			return new Promise((resolve, reject) => {
				return this.userService.findByUsername(decoded.username).then(user => {
					if (user) {
						
						context.switchToWs().getData().author = user.username
						resolve(user);
					} else {
						reject(false);
					}
				});
			});
		}
		catch (ex) {
			console.log(ex);
			return false;
		}
	}
}