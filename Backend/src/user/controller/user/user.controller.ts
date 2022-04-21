import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Request, Session, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import * as session from 'express-session';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserDto } from 'src/user/dto/user.dto';
import { TwoFactorGuard } from '../../../guards/two-factor.guard';
import { GetUsername } from '../../decorator/get-username.decorator';
import { UpdateAvatarDto } from '../../dto/update-avatar.dto';
import { User } from '../../entity/user.entity';
import { Express } from 'express';
import { UserService } from 'src/user/service/user/user.service';


@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {

    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get()
    findAll(): Promise<UserDto[]> {
        console.log('findAllUsers');
        return this.userService.findAll();
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get('me')
    findMe(@GetUsername() username): Promise<UserDto> {
        return this.userService.findByUsername(username);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<UserDto> {
        console.log('findOneUser ', id);
        return this.userService.findOne(id);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    async addAvatar(@GetUsername() username, @UploadedFile() file: Express.Multer.File) {
        return this.userService.addAvatar(username, file.buffer, file.originalname);
    }

    // @ApiBearerAuth()
    // @UseGuards(TwoFactorGuard)
    // @Patch(':id')
    // updateAvatar(@Param('id') id: string, @Body(ValidationPipe) updateAvatarDto: UpdateAvatarDto, @GetUsername() username): Promise<UserDto> {
    //     console.log('updateUser ', id);
        
    //     return this.userService.updateAvatar(username, id, updateAvatarDto);
    // }

    //seulement pour tester
    @Post()
    create(): Promise<User> {
        return this.userService.create();
    }
}
