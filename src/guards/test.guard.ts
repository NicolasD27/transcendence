import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '../user/service/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../user/service/auth.service';

@Injectable()
export class TwoFactorGuard implements CanActivate {
    constructor(private userService: UserService,
		private jwtService: JwtService,
		private authService: AuthService
		) {
	}
  async canActivate(context: ExecutionContext): Promise<any> {
    try {
        const headers = context.switchToHttp().getRequest().headers;
        const bearerToken = headers.cookie
        .split('; ')
        .find((cookie: string) => cookie.startsWith('accessToken'))
        .split('=')[1];
        const refreshToken = headers.cookie
            .split('; ')
            .find((cookie: string) => cookie.startsWith('refreshToken'))
            .split('=')[1];
        const username = context.switchToHttp().getRequest().user.username
        try {
            console.log('first verify')
            const decoded = this.jwtService.verify(bearerToken) as any;
            return new Promise((resolve, reject) => {
                return this.userService.findByUsername(decoded.username).then(user => {
                    if (user) {
                            resolve(user);
                    } else {
                        reject(false);
                    }
                });
            });
        }
        catch (ex) {
            try {
                console.log('refresh')
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
                            reject(false);
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
        console.log('no author', context.switchToHttp().getRequest().user)
        const user = context.switchToHttp().getRequest().user
        if (!user)
            throw new UnauthorizedException();
        const username = user.username
        return new Promise((resolve, reject) => {
            return this.userService.findByUsername(username).then(user => {
                if (user && !user.isTwoFactorEnable) {
                    resolve(user);
                } else {
                    resolve(false);
                }
            });
        });
        
        
    }
}
}
