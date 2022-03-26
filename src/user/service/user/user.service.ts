import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateAvatarDto } from 'src/user/dto/update-avatar.dto';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        // @InjectRepository(User)
		@InjectRepository(User)
        private usersRepository: Repository<User>) {}
		// Repository<User>) {}


    async findAll(): Promise<User[]> {
        return this.usersRepository.find({
            relations: ['followers', 'followings', 'matchs1', 'matchs2']
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne(id);
        if (!user)
            throw new NotFoundException(`User #${id} not found`);
        return user;
    }

    async findByUsername(username: string): Promise<User> {
        const user = await this.usersRepository.findOne({ username });
        if (!user)
            throw new NotFoundException(`User ${username} not found`);
        return user;
    }

    async updateAvatar(current_username: string, id: string, updateAvatarDto: UpdateAvatarDto): Promise<User> {
        
        const user = await this.usersRepository.preload({
            id: +id,
            ...updateAvatarDto
        })
        if (!user)
            throw new NotFoundException(`User #${id} not found`);
        if (user.username != current_username)
            throw new UnauthorizedException();
        return this.usersRepository.save(user);
    }

    //just for dev
    async create(): Promise<User> {
        
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
