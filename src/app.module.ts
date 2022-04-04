import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import * as typeOrmConfig from './typeorm.config';
import { configValidationSchema } from './config.schema';
import { ChatModule } from './chat/chat.module';
import { AppController } from './app.controller';
import { FriendshipModule } from './friendship/friendship.module';
import { MatchModule } from './match/match.module';
import { ChannelController } from './channel/channel.controller';
import { ChannelModule } from './channel/channel.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			validationSchema: configValidationSchema,
		}),
		TypeOrmModule.forRoot(typeOrmConfig),
		UserModule,
		FriendshipModule,
		ChatModule,
		ChannelModule,
		MatchModule
	],
	controllers: [AppController, ChannelController]
})
export class AppModule {}
