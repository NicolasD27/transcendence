import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain, classToPlainFromExist, instanceToPlain, plainToInstance } from 'class-transformer';
import { UserDto } from 'src/user/dto/user.dto';
import { Connection, Repository } from 'typeorm';
import { UpdateAvatarDto } from '../dto/update-avatar.dto';
import { User, UserStatus } from '../entity/user.entity';
import DatabaseFilesService from './database-file.service';

@Injectable()
export class UserService {
    constructor(
		@InjectRepository(User)
        private usersRepository: Repository<User>,
        private readonly databaseFilesService: DatabaseFilesService,
        private connection: Connection
    ) {}


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

    async addAvatar(username: string, imageBuffer: Buffer, filename: string) {
        const user = await this.findByUsername(username);
        const queryRunner = this.connection.createQueryRunner();
     
        await queryRunner.connect();
        await queryRunner.startTransaction();
     
        try {
          const user = await this.findByUsername(username);
          const currentAvatarId = user.avatarId;
          const avatar = await this.databaseFilesService.uploadDatabaseFileWithQueryRunner(imageBuffer, filename, queryRunner);
     
          await queryRunner.manager.update(User, user.id, {
            avatarId: avatar.id
          });
     
          if (currentAvatarId) {
            await this.databaseFilesService.deleteFileWithQueryRunner(currentAvatarId, queryRunner);
          }
     
          await queryRunner.commitTransaction();
     
          return avatar;
        } catch {
          await queryRunner.rollbackTransaction();
          throw new InternalServerErrorException();
        } finally {
          await queryRunner.release();
        }
      }

    // async updateAvatar(current_username: string, id: string, updateAvatarDto: UpdateAvatarDto): Promise<UserDto> {
        
    //     const user = await this.usersRepository.preload({
    //         id: +id,
    //         ...updateAvatarDto
    //     })
    //     if (!user)
    //         throw new NotFoundException(`User #${id} not found`);
    //     if (user.username != current_username)
    //         throw new UnauthorizedException();
    //     this.usersRepository.save(user);
    //     return User.toDto(user)
    // }

    async updateStatusByUsername(newStatus: UserStatus, username: string): Promise<UserDto> {
        const user = await this.usersRepository.findOne({ username });
        if (!user)
            throw new NotFoundException(`User ${username} not found`);
        user.status = newStatus
        this.usersRepository.save(user);
        return User.toDto(user)
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
