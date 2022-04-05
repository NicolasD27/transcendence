import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { FriendshipController } from './controller/friendship.controller';
import { Friendship } from './entity/friendship.entity';
import { FriendshipService } from './service/friendship.service';

@Module({
    imports: [TypeOrmModule.forFeature([Friendship, User])],
    controllers: [FriendshipController],
    providers: [FriendshipService]
})
export class FriendshipModule {}
