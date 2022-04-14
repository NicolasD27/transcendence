import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain, classToPlainFromExist, instanceToPlain, plainToInstance } from 'class-transformer';
import { UserDto } from 'src/user/dto/user.dto';
import { Repository } from 'typeorm';
import { UpdateAvatarDto } from '../../dto/update-avatar.dto';
import { User, UserStatus } from '../../entity/user.entity';

@Injectable()
export class UserService {
    constructor(
		@InjectRepository(User)
        private usersRepository: Repository<User>) {}


    async findAll(): Promise<UserDto[]> {
        
        return this.usersRepository.find()
            .then(items => items.map(e=> User.toDto(e)));
    }

    async findOne(id: string): Promise<UserDto> {
        const user = await this.usersRepository.findOne(id);
        if (!user)
            throw new NotFoundException(`User #${id} not found`);
        return User.toDto(user);
    }

    async findByUsername(username: string): Promise<UserDto> {
        const user = await this.usersRepository.findOne({ username });
        if (!user)
            throw new NotFoundException(`User ${username} not found`);
        return User.toDto(user);
    }

    async updateAvatar(current_username: string, id: string, updateAvatarDto: UpdateAvatarDto): Promise<UserDto> {
        
        const user = await this.usersRepository.preload({
            id: +id,
            ...updateAvatarDto
        })
        if (!user)
            throw new NotFoundException(`User #${id} not found`);
        if (user.username != current_username)
            throw new UnauthorizedException();
        this.usersRepository.save(user);
        return User.toDto(user)
    }

    async updateStatusByUsername(newStatus: UserStatus, username: string): Promise<UserDto> {
        const user = await this.usersRepository.findOne({ username });
        if (!user)
            throw new NotFoundException(`User ${username} not found`);
        user.status = newStatus
        this.usersRepository.save(user);
        return User.toDto(user)
    }

    //just for dev
    async create(): Promise<UserDto> {
        
        const user = {
            username: this.make_username(8)
        }
        return this.usersRepository.save(user);
    }

    private make_username(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
        }
        return result;
        }

}