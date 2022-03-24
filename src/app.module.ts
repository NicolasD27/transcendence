import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import * as typeOrmConfig from './typeorm.config';
import { configValidationSchema } from './config.schema';
import { ChatModule } from './chat/chat.module';
import { AppController } from './app.controller';
import { FriendshipModule } from './friendship/friendship.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			validationSchema: configValidationSchema,
		}),
		TypeOrmModule.forRoot(typeOrmConfig),
		UserModule,
		FriendshipModule,
		ChatModule
	],
	controllers: [AppController]
})
export class AppModule {}
