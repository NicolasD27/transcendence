import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { User } from "../entity/user.entity";
import { JwtPayload } from "../interface/jwt-payload.interface";

import * as config from 'config'
import { Repository } from "typeorm";

const dbConfig = config.get('jwt')

@Injectable()
export class JwtTwoFaStrategy extends PassportStrategy(Strategy, 'jwt-two-factor') {
    constructor(
        @InjectRepository(User)
        private  usersRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET || dbConfig.secret
        })
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { username } = payload;
        const user = await this.usersRepository.findOne({ username });

        if (!user) {
            throw new UnauthorizedException()
        }

        if (!user.isTwoFactorEnable) {
            return user;
        }
        if (payload.isTwoFaAuthenticated) {
            return user;
        }
    }
}