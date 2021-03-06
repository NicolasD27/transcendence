import { AuthService } from "./auth.service";
import * as config from 'config';
import { Injectable } from "@nestjs/common";
import { User } from "../entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { authenticator } from "otplib";
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { JwtPayload } from "../interface/jwt-payload.interface";
import { Repository } from "typeorm";

const dbConfig = config.get('jwt');

@Injectable()
export class TwoFactorAuthService {
    constructor(
        @InjectRepository(User)
        private  usersRepository: Repository<User>,
        private authService: AuthService
    ) {}

    public async generateTwoFactorAuthSecret(username: string) {
        const user = await this.usersRepository.findOne({ username });
        const app_name = process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME || dbConfig.twoFactorAppName;
        if (user) {
            if (user.twoFactorAuthSecret) {
                const otpAuthUrl = authenticator.keyuri(username, app_name, user.twoFactorAuthSecret);
                return {
                    otpAuthUrl
                }
            }
        }

        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(username, app_name, secret);

        await this.usersRepository.update({ username: username }, { twoFactorAuthSecret: secret });
        return {
            secret,
            otpAuthUrl
        }
    }

    public async qrCodeStreamPipe(stream: Response, otpPathUrl: string) {
        return toFileStream(stream, otpPathUrl);
    }

    public async activationOfTwoFa(username: string, status: boolean) {
        return await this.usersRepository.update({ username: username }, {
            isTwoFactorEnable: status
        });
    }

    public async desactivationOfTwoFa(username: string, status: boolean) {
        return await this.usersRepository.update({ username: username }, {
            isTwoFactorEnable: status
        });
    }

    public async verifyTwoFaCode(code: string, username: string) {
        const user = await this.usersRepository.findOne({ username })
        return authenticator.verify({
            token: code,
            secret: user.twoFactorAuthSecret
        });
    }

    async signIn(username: string, isTwoFaAuthenticated: boolean): Promise<{ accessToken: string, user: JwtPayload }> {
        const user = await this.usersRepository.findOne({ username })
        const data = {
            isTwoFaAuthenticated,
            isTwoFactorEnable: user.isTwoFactorEnable,
            username: username,
        }
        const accessToken = await this.authService.getAccessToken(data);
        // const refreshToken = await this.authService.getRefreshToken(data);

        // await this.authService.updateRefreshTokenInUser(refreshToken, user.username);

        return {
            accessToken,
            // refreshToken,
            user: {
                username: user.username,
            }
        };
    }

}