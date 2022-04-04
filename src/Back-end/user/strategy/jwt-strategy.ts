import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { User } from "../entity/user.entity";
import { JwtPayload } from "../interface/jwt-payload.interface";

import { Repository } from "typeorm";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET
        })
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { username } = payload
        const user = await this.usersRepository.findOne({ username })

        if (!user) {
            throw new UnauthorizedException()
        }
        return user
    }
}