import { INestApplicationContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { UserService } from './user/service/user.service';

export class AuthSocketAdapter extends IoAdapter {

  private readonly jwtService: JwtService;
  private readonly userService: UserService;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.jwtService = this.app.get(JwtService);
	this.userService = this.app.get(UserService);
  }

  createIOServer(port: number, options?: any): any {
    options.allowRequest = async (request, allowFunction) => {
		let accessToken;
		let username;
		const cookie_string = request.headers.cookie
		if (!cookie_string)
		return allowFunction("No cookie", false);
		const cookies = request.headers.cookie.split('; ')
		if (cookies.find((cookie: string) => cookie.startsWith('username')))
			username = cookies.find((cookie: string) => cookie.startsWith('username')).split('=')[1];
		else
            return allowFunction("No username", false);
		if (cookies.find((cookie: string) => cookie.startsWith('accessToken')))
			accessToken = cookies.find((cookie: string) => cookie.startsWith('accessToken')).split('=')[1];
		else
			return allowFunction("No access token", false);

		try {
			console.log("on est dans le try");
			console.log(await this.userService.findByUsername(username));
		}
		catch (ex) {
			return allowFunction('User not registerd', false);
		}

		try {
			console.log("++++++++++++ oui ++++++++++");
			const decoded = this.jwtService.verify(accessToken) as any;
			console.log("++++++++++++ oui ++++++++++");
            return allowFunction(null, true);
		}
		catch (ex) {
			return allowFunction('Unauthorized', false);
		}
    };
    return super.createIOServer(port, options);
  }
}