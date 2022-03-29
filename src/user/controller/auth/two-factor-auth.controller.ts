import { BadRequestException, Body, ClassSerializerInterceptor, Controller, HttpException, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { GetUser } from "../../decorator/get-user.decorator";
import { User } from "../../entity/user.entity";
import { TwoFactorAuthService } from "../../service/two-factor-auth.service";
import { Response } from 'express';
import { TwoFaAuthDto } from "../../dto/two-fa-auth.dto";
import { AuthenticatedGuard } from "src/guards/authenticated.guard";
import { TwoFactorGuard } from '../../../guards/two-factor.guard';

@ApiTags('Two FA')
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuth {
    constructor(
        private readonly twoFactorAuthService: TwoFactorAuthService
    ) {}
    
    @UseGuards(AuthenticatedGuard)
    @Post('generate-qr')
    async generateQrCode(
        @Res() response: Response, @GetUser() user: User
    ) {
        const { otpAuthUrl } = await this.twoFactorAuthService.generateTwoFactorAuthSecret(user);
        if (!otpAuthUrl)
            throw new BadRequestException('QR already generated')
        response.setHeader('content-type','image/png');
        return this.twoFactorAuthService.qrCodeStreamPipe(response, otpAuthUrl);
    }

    @UseGuards(AuthenticatedGuard)
    @Post('turn-on-2FA')
    async activationOfTwoFa(
        @GetUser() user: User,
        @Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto,
        @Res({ passthrough: true}) res: Response
    ) {
        const isCodeValid = await this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, user.username);
        if (!isCodeValid) {
            throw new UnauthorizedException('Invalid authentication code');
        }
        await this.twoFactorAuthService.activationOfTwoFa(user.username, true);
        const payload = await this.twoFactorAuthService.signIn(user, true);
        res.cookie('accessToken', payload.accessToken)
        // res.cookie('refreshToken', payload.refreshToken)
        res.cookie('username', payload.user.username)
        return payload;
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post('turn-off-2FA')
    async desactivationOfTwoFa(
        @GetUser() user: User
    ) {
        
        await this.twoFactorAuthService.desactivationOfTwoFa(user.username, false);
    }

    // This function will be called if 2FA is on (activationOfTwoFa method)
    @Post('authenticate')
    @UseGuards(AuthenticatedGuard)
    async authenticate(
        @GetUser() user: User,
        @Body(ValidationPipe) twoFaAuthDto: TwoFaAuthDto,
        @Res({ passthrough: true}) res: Response
    ) {
        const isCodeValid = await this.twoFactorAuthService.verifyTwoFaCode(twoFaAuthDto.code, user.username);
        if (!isCodeValid) {
            throw new UnauthorizedException('Invalid authentication code');
        }
        const payload = await this.twoFactorAuthService.signIn(user, true);
        res.cookie('accessToken', payload.accessToken)
        // res.cookie('refreshToken', payload.refreshToken)
        res.cookie('username', payload.user.username)
        return payload;
    }


}