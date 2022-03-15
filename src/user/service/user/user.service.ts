import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>) {}


    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }
    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne(id);
        if (user)
            return user;
        return null;
    }

}
