import { Post, Controller, Get, UseGuards, Redirect, Res, Req, NotFoundException } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { GetUsername } from "../../decorator/get-username.decorator"
import { AuthService } from "../../service/auth.service"
import { FtOauthGuard } from '../../../guards/ft-oauth.guard';
import { Profile } from "passport-42"
import { Response, Request } from "express"
import { TwoFactorGuard } from '../../../guards/two-factor.guard';
import { GetProfile42 } from "../../decorator/get-profile-42.decorator"

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
    @Redirect('')
    async ftAuthCallback(@Res({ passthrough: true}) res: Response, @GetProfile42() profile: Profile): Promise<any> {
        const userExist = await this.authService.userExists(profile.username);
        let payload;
        if (userExist)
            payload = (await this.authService.signIn(profile.username));
        else
            payload = (await this.authService.signUp(profile));

        const maxAge = 7200000
        res.cookie('accessToken', payload.accessToken, { maxAge: maxAge })
        res.cookie('username', payload.user.username, { maxAge: maxAge })
        if (!userExist)
            return {url: `http://${process.env.APP_HOST || "localhost"}:3000/register`}
        else if (payload.user.isTwoFactorEnable)
            return {url: `http://${process.env.APP_HOST || "localhost"}:3000/login-2FA`}
        else
            return {url: `http://${process.env.APP_HOST || "localhost"}:3000/mainpage`}
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post('/logout')
    async logout(
        @Res({ passthrough: true}) res: Response,
        @Req() req: Request,
        @GetUsername() username
    ) {
        const userExist = await this.authService.userExists(username);
        let payload;
        if (userExist)
            payload = (await this.authService.getTokens(username));
        else
            throw new NotFoundException("user not found")
        res.clearCookie('accessToken', payload.accessToken)
        res.clearCookie('username', payload.user.username)
        req.logout(null);
    }
}