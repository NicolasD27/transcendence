import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../auth/entity/user.entity";
import { UserInfoDto } from "../dto/user-info.dto";
import { UserInfo } from "../entity/user-info.entity";
import { userInfoData } from "../interface/user-info.interface";
import { UserInfoRepository } from "../repository/user-info.repository";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserInfoRepository)
        private userInfoRepository: UserInfoRepository
    ) {}

    async getUser(
        user: User
    ): Promise<UserInfo> {
        const userInfo = await this.userInfoRepository.findOne({ where : { id: user.id } })

        if (!userInfo) {
            throw new NotFoundException("User not found.");
        }
        return userInfo
    }

    async updateUserProfile(
        user: User,
        userInfoDto: UserInfoDto
    ): Promise<userInfoData> {
        const userInfo = await this.getUser(user)
        
        
        await userInfo.save()
        return userInfo
    }
}