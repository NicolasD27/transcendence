import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { activeUsers } from 'src/auth-socket.adapter';
import { Notification } from 'src/notification/entity/notification.entity';
import { NotificationService } from 'src/notification/service/notification.service';
import { UserDto } from 'src/user/dto/user.dto';
import { Connection, Repository } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { createFriendshipDto } from '../dto/create-friendship.dto';
import { FriendshipDto } from '../dto/friendship.dto';
import { updateFriendshipDto } from '../dto/update-friendship.dto';
import { Friendship, FriendshipStatus } from '../entity/friendship.entity';
import { FriendshipRepository } from '../repository/friendship.repository';

@Injectable()
export class FriendshipService {
    constructor(
        @InjectRepository(Friendship)
        private  friendshipsRepository: Repository<Friendship>,
        @InjectRepository(User)
        private  usersRepository: Repository<User>,
        private readonly notificationService: NotificationService,
        private connection: Connection
        ) {
            // friendshipsRepository = connection.getCustomRepository(FriendshipRepository)
        }

    async findAllByUser(user_id: string): Promise<FriendshipDto[]> {
		console.log("activeUsers");
		console.log(activeUsers);
        const user = await this.usersRepository.findOne(user_id);
        if (!user)
            throw new NotFoundException(`user #${user_id} not found`)
        return this.friendshipsRepository.find({
            where: [
                { follower: user },
                { following: user },
            ],
        })
        .then(items => items.map(e=> Friendship.toDto(e)));
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

    async checkFriendship(username1: string, username2: string) : Promise<boolean>
    {
        const user1 = await this.usersRepository.findOne({username: username1})
        if (!user1)
            return false;
        const user2 = await this.usersRepository.findOne({username: username2})
        if (!user2)
            return false;
        const friendship = await this.friendshipsRepository.findOne({
            where: [
                {follower: user1, following: user2, status: FriendshipStatus.ACTIVE},
                {follower: user2, following: user1, status: FriendshipStatus.ACTIVE}
            ]
        });
        if (!friendship)
            return false;
        return true;
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

        friendship = await this.friendshipsRepository.create({
            follower: follower,
            following: following,
        });
        await this.friendshipsRepository.save(friendship)
        this.notificationService.create(friendship, following);
        return Friendship.toDto(friendship)
    }

    async update(username: string, id: number, newStatus: number): Promise<FriendshipDto> {
        const user = await this.usersRepository.findOne({username})
        const friendship = await this.friendshipsRepository.findOne(id);
        if (!friendship)
            throw new NotFoundException(`Friendship #${id} not found`);
        if ((username == friendship.follower.username && (newStatus == FriendshipStatus.BLOCKED_BY_FOLLOWING || friendship.status == FriendshipStatus.BLOCKED_BY_FOLLOWING)) || (username == friendship.following.username && (newStatus == FriendshipStatus.BLOCKED_BY_FOLLOWER || friendship.status == FriendshipStatus.BLOCKED_BY_FOLLOWER)))
            throw new UnauthorizedException("you can't do that !");
        friendship.status = newStatus;
        this.notificationService.actionPerformedFriendship(friendship, user)
        if (newStatus == FriendshipStatus.ACTIVE)
        {
            const otherUser = friendship.follower.username == username ? friendship.following : friendship.follower
            const notification = await this.notificationService.create(friendship, otherUser);
            this.notificationService.actionPerformedFriendship(friendship, otherUser)
        }
        return Friendship.toDto(await  this.friendshipsRepository.save(friendship));

    }


    async destroy(username: string, id: string): Promise<FriendshipDto> {
        const user = await this.usersRepository.findOne({username})
        const friendship = await this.friendshipsRepository.findOne(id);
        if (!friendship)
            throw new NotFoundException(`Friendship #${id} not found`);
        if ((username != friendship.follower.username && username != friendship.following.username))
            throw new UnauthorizedException();
        this.notificationService.actionPerformedFriendship(friendship, user)
        return Friendship.toDto(await this.friendshipsRepository.remove(friendship));

    }

}
