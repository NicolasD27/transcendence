import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Request, Session, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
// import * as session from 'express-session';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorGuard } from '../../../guards/two-factor.guard';
import { GetUsername } from '../../decorator/get-username.decorator';
import { UpdateAvatarDto } from '../../dto/update-avatar.dto';
import { User } from '../../entity/user.entity';
<<<<<<< HEAD
import { UserService } from '../../service/user/user.service';
=======
import { Express } from 'express';
import { UserService } from 'src/user/service/user.service';
import { MatchDto } from 'src/match/dto/match.dto';
import { MatchService } from 'src/match/service/match.service';
import { UpdatePseudoDto } from 'src/user/dto/update-pseudo.dto';

>>>>>>> master

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
<<<<<<< HEAD
=======
    @Get('me')
    findMe(@GetUsername() username): Promise<UserDto> {
        return this.userService.findMe(username);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
>>>>>>> master
    @Get(':id')
    findOne(@Param('id') id: string): Promise<User> {
        console.log('findOneUser ', id);
        return this.userService.findOne(id);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
<<<<<<< HEAD
    @Patch(':id')
    updateAvatar(@Param('id') id: string, @Body(ValidationPipe) updateAvatarDto: UpdateAvatarDto, @GetUsername() username): Promise<User> {
        console.log('updateUser ', id);
=======
    @Get(':id/matchs')
    findAllMatchsByUser(@Param('id') id: string): Promise<MatchDto[]> {
        return this.matchService.findAllMatchsByUser(id);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    async addAvatar(@GetUsername() username, @UploadedFile() file: Express.Multer.File) {
        return this.userService.addAvatar(username, file.buffer, file.originalname);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post('pseudo')
    @UseInterceptors(FileInterceptor('file'))
    async changePseudo(@GetUsername() username, @Body() updatePseudoDto: UpdatePseudoDto) {
        return this.userService.changePseudo(username, updatePseudoDto);
    }

    // @ApiBearerAuth()
    // @UseGuards(TwoFactorGuard)
    // @Patch(':id')
    // updateAvatar(@Param('id') id: string, @Body(ValidationPipe) updateAvatarDto: UpdateAvatarDto, @GetUsername() username): Promise<UserDto> {
    //     console.log('updateUser ', id);
>>>>>>> master
        
        return this.userService.updateAvatar(username, id, updateAvatarDto);
    }

    //seulement pour tester
    @Post()
    create(): Promise<User> {
        return this.userService.create();
    }
}
