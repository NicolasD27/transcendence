import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Request, Session, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/guards/authenticated.guard';
import { UpdateAvatarDto } from 'src/user/dto/update-avatar.dto';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/service/user/user.service';
// import * as session from 'express-session';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {

    }

    @UseGuards(AuthenticatedGuard)
    @Get()
    findAll(@Session() session: Record<string, any>): Promise<User[]> {
        console.log('findAllUsers', session);
        return this.userService.findAll();
    }

    @UseGuards(AuthenticatedGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<User> {
        console.log('findOneUser ', id);
        return this.userService.findOne(id);
    }

    @UseGuards(AuthenticatedGuard)
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
