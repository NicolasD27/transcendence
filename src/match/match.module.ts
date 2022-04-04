import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/user/service/auth.service';
import { MatchGateway } from './gateway/match.gateway';
import { MatchService } from './service/match.service';
import { Match } from './entity/match.entity';
import { MatchController } from './controller/match.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Match]),
		JwtModule.register({
            secret: process.env.JWT_ACCESS_TOKEN_SECRET,
            signOptions: {
                expiresIn: +process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            }
        }),
	],
	controllers: [MatchController],
	providers: [MatchService, MatchGateway, AuthService],
	exports: [MatchService]
})
export class MatchModule {}
