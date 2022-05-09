import { Post, Body, Controller, Get, UseGuards, Redirect, Res, Req, NotFoundException } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { JwtRefreshTokenGuard } from "../../../guards/jwt-refresh-token.guard"
import { GetUsername } from "../../decorator/get-username.decorator"
import { RefreshTokenDto } from "../../dto/refresh-token.dto"
import { User } from "../../entity/user.entity"
import { JwtPayload } from "../../interface/jwt-payload.interface"
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
    // @Redirect('http://localhost:3000/')
    async ftAuthCallback(@Res({ passthrough: true}) res: Response, @GetProfile42() profile: Profile): Promise<any> {
        const userExist = await this.authService.userExists(profile.username);
        let payload;
        if (userExist)
            payload = (await this.authService.signIn(profile.username));
        else
            payload = (await this.authService.signUp(profile));
        res.cookie('accessToken', payload.accessToken)
        res.cookie('username', payload.user.username)
        // console.log(payload.refreshToken)
        if (payload.user.isTwoFactorEnable)
            return res.redirect("http://localhost:3000/2FA")
        else
            return res.redirect("http://localhost:3000")
        return ;
    }

    // @ApiBearerAuth()
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
        req.logout();
        // this.authService.signOut(profile.username)
    }

    // @ApiBearerAuth()
    // @UseGuards(JwtRefreshTokenGuard)
    // @Post('/refresh-token')
    // async refreshToken(
    //     @GetUsername() user: User,
    //     @Body() token: RefreshTokenDto
    // ){
    //     const user_info = await this.authService.GetUsernameIfRefreshTokenMatches(token.refresh_token, user.username)
    //     if (user_info) {
    //         const userInfo = {
    //             username: user_info.username,
    //         }

    //         if (user.isTwoFactorEnable) {
    //             userInfo['isTwoFaAuthenticated'] = true;
    //             userInfo['isTwoFactorEnable'] = user.isTwoFactorEnable;
                
    //         }

    //         return this.authService.getNewAccessAndRefreshToken(userInfo)
    //     } else{
    //         return null
    //     }
    // }
}