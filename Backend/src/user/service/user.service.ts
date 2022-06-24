import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { activeUsers } from 'src/auth-socket.adapter';
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';
import { Connection, Repository } from 'typeorm';
import { UpdatePseudoDto } from '../dto/update-pseudo.dto';
import { UserDto } from '../dto/user.dto';
import { User } from '../entity/user.entity';
import { UserStatus } from '../utils/user-status';
import DatabaseFilesService from './database-file.service';

@Injectable()
export class UserService {
	constructor(
		// @Inject(forwardRef(() => User))
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly databaseFilesService: DatabaseFilesService,
		private connection: Connection
	) {}

    async findAll(paginationQuery: PaginationQueryDto): Promise<UserDto[]> {
		const { limit, offset } = paginationQuery;
        return await this.usersRepository.find({
				where : {},
				order: { pseudo: "ASC" },
				take: limit,
				skip: offset
			})
            .then(items => items.map(e=> User.toDto(e, activeUsers)));
    }

	async searchForUsers(paginationQuery: PaginationQueryDto, search: string): Promise<UserDto[]> {
		const { limit, offset } = paginationQuery;
        return await this.usersRepository.find({
				where : `"username" ILIKE '${search}%'`,
				order: { pseudo: "ASC" },
				take: limit,
				skip: offset
			})
            .then(items => items.map(e=> User.toDto(e, activeUsers)));
    }

    async findOne(id: string): Promise<UserDto> {
        const user = await this.usersRepository.findOne(id);
        if (!user)
            throw new NotFoundException(`User #${id} not found`);
        return User.toDto(user, activeUsers);
    }

    async findMe(username: string): Promise<UserDto> {
        const user = await this.usersRepository.findOne({username});
        if (!user)
            throw new NotFoundException(`User ${username} not found`);
        return User.toDto(user, activeUsers);
    }

    async findByUsername(username: string): Promise<User>
	{
        const user = this.usersRepository.findOne({ username });
		return new Promise((resolve, reject) => {
			return user.then(user => {
				if (!user) {
					reject(false);
				} else {
					resolve(user);
				}
			});
		});
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
		}catch {
			await queryRunner.rollbackTransaction();
			throw new InternalServerErrorException();
		} finally {
			await queryRunner.release();
		}
	}

    async changePseudo(username: string, updatePseudoDto: UpdatePseudoDto): Promise<Boolean> {
        const user = await this.findByUsername(username);
        if (!user)
            throw new NotFoundException(`User ${username} not found`);
        user.pseudo = updatePseudoDto.pseudo
        return this.usersRepository.save(user).then(user => {return true}).catch(err => {return false});
    
    }

    async updateStatusByUsername(newStatus: UserStatus, username: string): Promise<UserDto> {
        const user = await this.usersRepository.findOne({ username });
        if (!user)
            throw new NotFoundException(`User ${username} not found`);
        user.status = newStatus
        this.usersRepository.save(user);
        return User.toDto(user, activeUsers)
    }

}
