import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Request, Session, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
// import * as session from 'express-session';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorGuard } from '../../../guards/two-factor.guard';
import { GetUsername } from '../../decorator/get-username.decorator';
import { UpdateAvatarDto } from '../../dto/update-avatar.dto';
import { User } from '../../entity/user.entity';
import { UserService } from '../../service/user/user.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {

    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get()
    findAll(): Promise<User[]> {
        console.log('findAllUsers');
        return this.userService.findAll();
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<User> {
        console.log('findOneUser ', id);
        return this.userService.findOne(id);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Patch(':id')
    updateAvatar(@Param('id') id: string, @Body(ValidationPipe) updateAvatarDto: UpdateAvatarDto, @GetUsername() username): Promise<User> {
        console.log('updateUser ', id);
        
        return this.userService.updateAvatar(username, id, updateAvatarDto);
    }

    //seulement pour tester
    @Post()
    create(): Promise<User> {
        return this.userService.create();
    }
}
