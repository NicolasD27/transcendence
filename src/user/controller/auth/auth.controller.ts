import { Post, Body, Controller, Get, UseGuards, Redirect } from "@nestjs/common"
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger"
import { JwtRefreshTokenGuard } from "../../../guards/jwt-refresh-token.guard"
import { JwtTwoFactorGuard } from "../../../guards/jwt-two-factor.guard"
import { GetUser } from "../../decorator/get-user.decorator"
import { RefreshTokenDto } from "../../dto/refresh-token.dto"
import { User } from "../../entity/user.entity"
import { JwtPayload } from "../../interface/jwt-payload.interface"
import { AuthService } from "../../service/auth.service"
import { FtOauthGuard } from '../../../guards/ft-oauth.guard';
import { GetProfile } from "../../decorator/get-profile.decorator"
import { Profile } from "passport-42"

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
    @Redirect('/api')
    async ftAuthCallback(@GetProfile() profile: Profile): Promise<{ accessToken: string, refreshToken?: string, user?: JwtPayload }> {
        const userExist = await this.authService.userExists(profile.username);
        if (userExist)
            return this.authService.signIn(profile);
        else
            return this.authService.signUp(profile);
    }

    @ApiBearerAuth()
    @UseGuards(JwtTwoFactorGuard)
    @Get('/logout')
    logout(
        @GetUser() user: User
    ) {
        this.authService.signOut(user)
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