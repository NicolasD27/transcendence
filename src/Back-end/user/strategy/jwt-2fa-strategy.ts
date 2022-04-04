import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { User } from "../entity/user.entity";
import { JwtPayload } from "../interface/jwt-payload.interface";

import { Repository } from "typeorm";


@Injectable()
export class JwtTwoFaStrategy extends PassportStrategy(Strategy, 'jwt-two-factor') {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
        },
            async (jwt_payload, done) => {
                console.log(jwt_payload)
                done(null, true)
                // this one is typically a DB call.
                // Assume that the returned user object is pre-formatted and ready for storing in JWT
                // try {
                //     const errMessage = { message: 'Incorrect email or password' };

                //     const user = await this.usersRepository.findOne({username});

                //     if (!user) {
                //         return done(null, false, errMessage);
                //     }

                //     const pwdValidation = await user.validPassword(password, user.password);
                //     if (!pwdValidation) {
                //         done(null, false, errMessage);
                //     } else {
                //         done(null, user, { message: 'Logged In Successfully' });
                //     }
                // } catch (err) {
                //     console.log(err);
                //     done(err);
                // }
            })
    }

    async validate(payload: JwtPayload): Promise<User> {
        console.log("payload", payload)
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