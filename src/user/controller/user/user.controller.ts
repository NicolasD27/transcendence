import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Request, Session, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/guards/authenticated.guard';
import { UpdateAvatarDto } from 'src/user/dto/update-avatar.dto';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/service/user/user.service';
// import * as session from 'express-session';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorGuard } from '../../../guards/two-factor.guard';

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
    updateAvatar(@Param('id') id: string, @Body(ValidationPipe) updateAvatarDto: UpdateAvatarDto, @Request() req): Promise<User> {
        console.log('updateUser ', id);
        
        return this.userService.updateAvatar(req.user.username, id, updateAvatarDto);
    }

    //seulement pour tester
    @Post()
    create(): Promise<User> {
        return this.userService.create();
    }
}
