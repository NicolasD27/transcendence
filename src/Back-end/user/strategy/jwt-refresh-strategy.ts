import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from "../interface/jwt-payload.interface";
import { AuthService } from "../service/auth.service";

import { Repository } from "typeorm";
import { User } from "../entity/user.entity";



@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
            secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
        })
    }

    async validate(payload: JwtPayload) {
        const { username } = payload;
        const user = await this.usersRepository.findOne({ username });

        if (!user) {
            throw new UnauthorizedException();
        }

        if (!user.isTwoFactorEnable) {
            return user;
        }

        if (payload.isTwoFaAuthenticated) {
            return user;
        }
    }
}