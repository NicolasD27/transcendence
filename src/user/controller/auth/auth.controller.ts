import { Post, Body, Controller, Get, UseGuards, Redirect, Res, Req } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { JwtRefreshTokenGuard } from "../../../guards/jwt-refresh-token.guard"
import { GetUser } from "../../decorator/get-user.decorator"
import { RefreshTokenDto } from "../../dto/refresh-token.dto"
import { User } from "../../entity/user.entity"
import { JwtPayload } from "../../interface/jwt-payload.interface"
import { AuthService } from "../../service/auth.service"
import { FtOauthGuard } from '../../../guards/ft-oauth.guard';
import { GetProfile } from "../../decorator/get-profile.decorator"
import { Profile } from "passport-42"
import { Response, Request } from "express"
import { TwoFactorGuard } from '../../../guards/test.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}
    
    @Get('42')
    @UseGuards(FtOauthGuard)
    ftAuth() {
        return;
    }

    @Get('42/return')
    @UseGuards(FtOauthGuard)
    @Redirect('/api/')
    async ftAuthCallback(@Res({ passthrough: true}) res: Response, @GetProfile() profile: Profile): Promise<any> {
        const userExist = await this.authService.userExists(profile.username);
        let payload;
        if (userExist)
            payload = (await this.authService.signIn(profile));
        else
            payload = (await this.authService.signUp(profile));
		// res.redirect('/api');
        res.cookie('accessToken', payload.accessToken)
        res.cookie('username', payload.user.username)
        res.cookie('refreshToken', payload.refreshToken)
        return {
            "url": '/api/',
            "statusCode": 301
          };
    }

    // @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post('/logout')
    async logout(
        @Res({ passthrough: true}) res: Response,
        @Req() req: Request,
        @GetProfile() profile: Profile
    ) {
        const userExist = await this.authService.userExists(profile.username);
        let payload;
        if (userExist)
            payload = (await this.authService.signIn(profile));
        res.clearCookie('accessToken', payload.accessToken)
        res.clearCookie('username', payload.user.username)
        res.clearCookie('refreshToken', payload.refreshToken)
       req.logout();
        this.authService.signOut(profile.username)
    }

    @ApiBearerAuth()
    @UseGuards(JwtRefreshTokenGuard)
    @Post('/refresh-token')
    async refreshToken(
        @GetUser() user: User,
        @Body() token: RefreshTokenDto
    ){
        const user_info = await this.authService.getUserIfRefreshTokenMatches(token.refresh_token, user.username)
        if (user_info) {
            const userInfo = {
                username: user_info.username,
            }

            if (user.isTwoFactorEnable) {
                userInfo['isTwoFaAuthenticated'] = true;
                userInfo['isTwoFactorEnable'] = user.isTwoFactorEnable;
                
            }

            return this.authService.getNewAccessAndRefreshToken(userInfo)
        } else{
            return null
        }
    }
}