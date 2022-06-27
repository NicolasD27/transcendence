import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../user/service/auth.service';
import { access } from 'fs';
import { UserService } from 'src/user/service/user.service';

@Injectable()
export class TwoFactorGuard implements CanActivate {

	constructor(
		private userService: UserService,
		private jwtService: JwtService,
		private authService: AuthService
	) {}

	async canActivate(context: ExecutionContext): Promise<any> {
		console.log("canActivate")
		let accessToken;
		let username;
		let myUser;
		const cookie_string = context.switchToHttp().getRequest().headers.cookie
		//console.log(context.switchToHttp().getRequest().headers);
		if (!cookie_string)
			throw new UnauthorizedException("No cookie");
		const cookies = context.switchToHttp().getRequest().headers.cookie.split('; ')
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
	
			if (decoded.username != username)
				throw new UnauthorizedException("User doesn't matches");

			myUser = await this.userService.findByUsername(decoded.username);
			if (!myUser)
				throw new UnauthorizedException("User needs to pass through the login process.");

			return myUser;

			// return new Promise((resolve, reject) => {
			// 	if (decoded.username != username)
			// 		return resolve(false)
			// 	return this.userService.findByUsername(decoded.username)
			// 	.then(user => {
			// 		if (user) {
			// 			resolve(user);
			// 		} else {
			// 			reject(false);
			// 		}
			// 	})
			// 	.catch(ex =>{
			// 		console.log("panic") ;
			// 		reject(false);
			// 	})
			// })
		}
		catch (ex) {
			console.log(ex);
			return false;
		}	
	}
}
