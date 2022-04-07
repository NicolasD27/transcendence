import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from 'src/user/dto/user.dto';
import { Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { createFriendshipDto } from '../dto/create-friendship.dto';
import { FriendshipDto } from '../dto/friendship.dto';
import { updateFriendshipDto } from '../dto/update-friendship.dto';
import { Friendship, FriendshipStatus } from '../entity/friendship.entity';

@Injectable()
export class FriendshipService {
    constructor(
        @InjectRepository(Friendship)
        private  friendshipsRepository: Repository<Friendship>,
        @InjectRepository(User)
        private  usersRepository: Repository<User>
        ) {}

    async findAllByUser(user_id: string): Promise<FriendshipDto[]> {
        const user = await this.usersRepository.findOne(user_id);
        if (!user)
            throw new NotFoundException(`user #${user_id} not found`)
        return this.friendshipsRepository.find({
            where: [
                { follower: user },
                { following: user },
            ],
        })
        .then(items => items.map(e=> Friendship.toDto(e)));;
    }

    async findAllActiveFriendsByUser(user_id: number): Promise<UserDto[]> {
        const user = await this.usersRepository.findOne(user_id);
        if (!user)
            throw new NotFoundException(`user #${user_id} not found`)
        return this.friendshipsRepository.find({
            where: [
                { follower: user, status: 1 },
                { following: user, status: 1 },
            ],
        })
        .then(friendships => friendships.map((frienship) =>  {
            if (frienship.follower.id == user_id)
                return User.toDto(frienship.following)
            else
                return User.toDto(frienship.follower)
        }));
    }

    async create(body: createFriendshipDto): Promise<FriendshipDto> {
        const follower = await this.usersRepository.findOne(body.user1_id);
        const following = await this.usersRepository.findOne(body.user2_id);
        if (!follower)
            throw new NotFoundException(`user #${body.user1_id} not found`)
        if (!following)
            throw new NotFoundException(`user #${body.user2_id} not found`)
        let friendship = await this.friendshipsRepository.findOne({
            where: [
                {follower: follower, following: following}
            ]
        })
        if (friendship)
            throw new BadRequestException("Frienship already exist");
        return Friendship.toDto(await this.friendshipsRepository.save({
            follower: follower,
            following: following,
        }));
    }

    async update(username: string, id: number, newStatus: number): Promise<FriendshipDto> {
        
        const friendship = await this.friendshipsRepository.findOne(id);
        if (!friendship)
            throw new NotFoundException(`Friendship #${id} not found`);
        if ((username == friendship.follower.username && (newStatus == FriendshipStatus.BLOCKED_BY_2 || friendship.status == FriendshipStatus.BLOCKED_BY_2)) || (username == friendship.following.username && (newStatus == FriendshipStatus.BLOCKED_BY_1 || friendship.status == FriendshipStatus.BLOCKED_BY_1)))
            throw new UnauthorizedException("you can't do that !");
        friendship.status = newStatus;
        return Friendship.toDto(await  this.friendshipsRepository.save(friendship));

    }

    
    async destroy(username: string, id: string): Promise<FriendshipDto> {
        const friendship = await this.friendshipsRepository.findOne(id);
        if (!friendship)
            throw new NotFoundException(`Friendship #${id} not found`);
        if ((username != friendship.follower.username && username != friendship.following.username))
            throw new UnauthorizedException();
        return Friendship.toDto(await this.friendshipsRepository.remove(friendship));

    }

}
