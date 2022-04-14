import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import * as typeOrmConfig from './typeorm.config';
import { configValidationSchema } from './config.schema';
import { ChatModule } from './message/message.module';
import { AppController } from './app.controller';
import { FriendshipModule } from './friendship/friendship.module';
import { MatchModule } from './match/match.module';
import { ChannelModule } from './channel/channel.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			validationSchema: configValidationSchema,
		}),
		TypeOrmModule.forRoot(typeOrmConfig),
		ChannelModule,
		UserModule,
		FriendshipModule,
		ChatModule,
		MatchModule
	],
	controllers: [AppController]
})
export class AppModule {}