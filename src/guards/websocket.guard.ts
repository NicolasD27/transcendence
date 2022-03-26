import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from 'src/user/service/user/user.service';
import { Observable } from 'rxjs';

import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { User } from 'src/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/user/service/auth.service';

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

		try {
			const bearerToken = context.switchToWs().getClient().handshake.headers.authorization.split(' ')[1];
			const refreshToken = context.switchToWs().getClient().handshake.headers.cookie
				.split('; ')
				.find((cookie: string) => cookie.startsWith('refreshToken'))
				.split('=')[1];
			const username = context.switchToWs().getClient().handshake.headers.cookie
			.split('; ')
			.find((cookie: string) => cookie.startsWith('username'))
			.split('=')[1];

			try {
				const decoded = this.jwtService.verify(bearerToken) as any;
				return new Promise((resolve, reject) => {
					return this.userService.findByUsername(decoded.username).then(user => {
						if (user) {
							{
								context.switchToWs().getData().author = user.username
								resolve(user);
							}
						} else {
							reject(true);
						}
					});
				});
			}
			catch (ex) {
				try {
					console.log('refreshing')
					return new Promise((resolve, reject) => {
						return this.authService.getUserIfRefreshTokenMatches(refreshToken, username).then(user => {
							if (user) {
								{
									const userInfo = {
										username: username,
									}
									if (user.isTwoFactorEnable) {
										userInfo['isTwoFaAuthenticated'] = true;
										userInfo['isTwoFactorEnable'] = user.isTwoFactorEnable;
										
									}
									this.authService.getNewAccessAndRefreshToken(userInfo)
									context.switchToWs().getData().author = user.username
									resolve(user);
								}
							} else {
								reject(true);
							}
						});
					});
				}
				catch(ex) {
					console.log(ex);
					return false;
				}
			}

		} catch (ex) {
			console.log(ex);
			throw new UnauthorizedException();
		}
	}
}