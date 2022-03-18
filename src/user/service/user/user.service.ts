import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { UserRepository } from 'src/user/repository/user.repository';

@Injectable()
export class UserService {
    constructor(
        // @InjectRepository(User)
		@InjectRepository(UserRepository)
        private usersRepo: UserRepository) {}
		// Repository<User>) {}


    async findAll(): Promise<User[]> {
        return this.usersRepo.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepo.findOne(id);
        if (user)
            return user;
        return null;
    }

}
