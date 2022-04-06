import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./entity/channel.entity";
import { ChannelService } from "./service/channel.service";
import { ChannelController } from "./controller/channel.controller";
import { User } from "../user/entity/user.entity";
import { Msg } from "../message/entity/msg.entity";
import { AuthService } from "../user/service/auth.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([Channel, User, Msg]),
		JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            }
        }),
	],
	controllers: [ChannelController],
	providers: [ChannelService, AuthService],
	exports: [ChannelService]
})
export class ChannelModule {}