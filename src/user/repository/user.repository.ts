import { EntityRepository, Repository } from "typeorm";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

import { User } from "../entity/user.entity";
import { JwtPayload } from "../interface/jwt-payload.interface";
import { Profile } from "passport-42";
import { GetProfile } from "../decorator/get-profile.decorator";

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async signUp(profile: Profile): Promise<{ message: string }> {
        // const { username, password } = signupCredentialsDto

        const user = new User()
        user.username = profile.username;
        user.avatar = profile._json.image_url;
        // user.salt = await bcrypt.genSalt()
        
        // user.password = await this.hashPassword(password, user.salt)
        
        try {
            await user.save()

            return { message: 'User successfully created !' }
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Username already exists')
            } else {
                throw new InternalServerErrorException()
            }
        }
    }

    async findProfile(username: string): Promise <JwtPayload> {
        const auth = await this.findOne({ username })
        if (auth) {
            return {
                isTwoFactorEnable: auth.isTwoFactorEnable,
                username: auth.username,
            }
        } else {
            return null
        }
    }

    async getUserInfoByUsername(username: string) {
        const auth = await this.findOne({ username })

        if (auth) {
            return auth
        } else {
            return null
        }
    }

    private async hashPassword(password: string, salt: string): Promise<string>{
        return bcrypt.hash(password, salt)
    }
}