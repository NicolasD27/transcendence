import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./entity/channel.entity";
import { ChannelService } from "./service/channel.service";
import { AuthService } from "src/user/service/auth.service";
import { Participation } from "./entity/participation.entity";
import { User } from "src/user/entity/user.entity";
import { Msg } from "src/message/entity/msg.entity";
import { ChannelController } from "./controller/channel.controller";
import { ModerationTimeOut } from "./entity/moderationTimeOut.entity";
import { ChatGateway } from "src/message/gateway/message.gateway";
import { ChannelInvite } from "./entity/channelInvite.entity";
import { NotificationRepository } from "src/notification/repository/notification.repository";
import { Notification } from "src/notification/entity/notification.entity";
import { NotificationService } from "src/notification/service/notification.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Channel, User, Msg, Participation,
			ModerationTimeOut, ChannelInvite, Notification, NotificationRepository
		]),
		JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            }
        }),
		//ChatGateway,
	],
	controllers: [ChannelController],
	providers: [ChannelService, AuthService, NotificationService],
	exports: [ChannelService]
})
export class ChannelModule {}