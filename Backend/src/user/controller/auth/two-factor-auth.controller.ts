import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Get, HttpException, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetUsername } from "../../decorator/get-username.decorator";
import { User } from "../../entity/user.entity";
import { TwoFactorAuthService } from "../../service/two-factor-auth.service";
import { Response } from 'express';
import { TwoFaAuthDto } from "../../dto/two-fa-auth.dto";
import { TwoFactorGuard } from '../../../guards/two-factor.guard';
import { AuthenticatedGuard } from "../../../guards/authenticated.guard";

@ApiTags('Two FA')
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuth {
    constructor(
        private readonly twoFactorAuthService: TwoFactorAuthService
    ) {}
    
    // @UseGuards(AuthenticatedGuard)
    @Get('generate-qr')
    async generateQrCode(
        @Res() response: Response, @GetUsername() username: string
    ) {
        const { otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthSecret(username);
        if (!otpAuthUrl)
            throw new BadRequestException('QR already generated')
        response.setHeader('content-type','image/png');
        return this.twoFactorAuthService.qrCodeStreamPipe(response, otpAuthUrl);
    }

    @UseGuards(AuthenticatedGuard)
    @Post('turn-on-2FA')
    async activationOfTwoFa(
        @GetUsername() username: string,
        @Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto,
        @Res({ passthrough: true}) res: Response
    ) {
        const isCodeValid = await this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, username);
        if (!isCodeValid) {
            throw new UnauthorizedException('Invalid authentication code');
        }
        await this.twoFactorAuthService.activationOfTwoFa(username, true);
        const payload = await this.twoFactorAuthService.signIn(username, true);
        res.cookie('accessToken', payload.accessToken)
        res.cookie('username', payload.user.username)
        return payload;
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post('turn-off-2FA')
    async desactivationOfTwoFa(
        @GetUsername() username: string
    ) {
        
        await this.twoFactorAuthService.desactivationOfTwoFa(username, false);
    }

    // This function will be called if 2FA is on (activationOfTwoFa method)
    @Post('authenticate')
    @UseGuards(AuthenticatedGuard)
    async authenticate(
        @GetUsername() username: string,
        @Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto,
        @Res({ passthrough: true}) res: Response
    ) {
        console.log(twoFaAuthDto.code)
        const isCodeValid = await this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, username);
        if (!isCodeValid) {
            throw new UnauthorizedException('Invalid authentication code');
        }
        const payload = await this.twoFactorAuthService.signIn(username, true);
        res.cookie('accessToken', payload.accessToken)
        // res.cookie('refreshToken', payload.refreshToken)
        res.cookie('username', payload.user.username)
        return payload;
    }


}