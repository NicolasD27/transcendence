import { Injectable, UnauthorizedException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entity/user.entity";
import { JwtPayload } from "../interface/jwt-payload.interface";
import * as bcrypt from 'bcrypt'

import * as config from 'config'
import { Profile } from "passport-42";
import { Repository } from 'typeorm';

const dbConfig = config.get('jwt')

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private  usersRepository: Repository<User>,
        private jwtService: JwtService
    ) {}

    async signUp(profile: Profile): Promise<{ accessToken?: string, refreshToken?: string, user?: JwtPayload }> {
        const user = this.usersRepository.create({
            username: profile.username,
            pseudo: profile.username,
            avatar: profile._json.image_url
        })
        await this.usersRepository.save(user);
        return this.signIn(profile.username);
        
    }

    async signIn(username: string): Promise<{ accessToken?: string, user?: JwtPayload }> {
        const user = await this.usersRepository.findOne( { username });
        const resp = {
            username: user.username,
            isTwoFactorEnable: user.isTwoFactorEnable,
        }
        if (!resp) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (resp.isTwoFactorEnable) {
            return {
                accessToken: 'wef',
                user: user
            }
        }
        const accessToken = await this.getAccessToken(resp);
        
        // const refreshToken = await this.getRefreshToken(resp);

        // await this.updateRefreshTokenInUser(refreshToken, resp.username);

        return {
            accessToken,
            // refreshToken,
            user: resp
        }
    }

    async userExists(username: string): Promise<boolean> {
        const resp = await this.usersRepository.findOne({ username });
        if (resp)
            return true;
        else
            return false;
    }

    // async signOut(username: string) {
    //     await this.updateRefreshTokenInUser(null, username)
    // }

    // async updateRefreshTokenInUser(refreshToken, username) {
    //     if (refreshToken) {
    //         refreshToken = await bcrypt.hash(refreshToken, 10)
    //     }
        
    //     await this.usersRepository.update({ username: username }, {
    //         hashedRefreshToken: refreshToken
    //     })
    // }

    async getAccessToken(payload: JwtPayload) {
        //console.log('new access token')
        const accessToken = await this.jwtService.sign(payload, {
            secret: process.env.JWT_ACCESS_TOKEN_SECRET || dbConfig.secret,
            expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME || dbConfig.expiresIn
        })
        //console.log('new access token', accessToken)
        return accessToken
    }

    // async getRefreshToken(payload: JwtPayload) {
    //     const refreshToken = await this.jwtService.sign(payload, {
    //         secret: process.env.JWT_REFRESH_TOKEN_SECRET || dbConfig.refreshSecret,
    //         expiresIn: +process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME || dbConfig.refreshExpiresIn
    //     })
    //     return refreshToken
    // }

    async getTokens(username: string) {
        const user = await this.usersRepository.findOne( {username: username });
        const resp = {
            username: user.username,
            isTwoFactorEnable: user.isTwoFactorEnable,
        }
        if (!resp) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const accessToken = await this.getAccessToken(resp);
        // const refreshToken = await this.getRefreshToken(resp);
        return {
            accessToken,
            // refreshToken,
            user: resp
        }
    }

    // async getNewAccessAndRefreshToken(payload: JwtPayload) {
    //     const refreshToken = await this.getRefreshToken(payload)
    //     await this.updateRefreshTokenInUser(refreshToken, payload.username)

    //     return {
    //         accessToken: await this.getAccessToken(payload),
    //         refreshToken: refreshToken
    //     }
    // }

    // async GetUsernameIfRefreshTokenMatches(refreshToken: string, username: string) {
    //     const user = await this.usersRepository.findOne({ username })

    //     const isRefreshTokenMatching = await bcrypt.compare(
	// 		refreshToken,
	// 		user.hashedRefreshToken
    //     );

    //     if (isRefreshTokenMatching) {
    //         await this.updateRefreshTokenInUser(null, username)
	// 		return user;
    //     } else {
    //         throw new UnauthorizedException();
    //     }
    // }
}