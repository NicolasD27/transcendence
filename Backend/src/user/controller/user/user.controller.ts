import {
    Body,
    Controller,
    Get,
    Delete,
    Req,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
// import * as session from 'express-session';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserDto } from 'src/user/dto/user.dto';
import { TwoFactorGuard } from '../../../guards/two-factor.guard';
import { GetUsername } from '../../decorator/get-username.decorator';
import { User } from '../../entity/user.entity';
import { Express, Request } from 'express';
import { UserService } from 'src/user/service/user.service';
import { MatchDto } from 'src/match/dto/match.dto';
import { MatchService } from 'src/match/service/match.service';
import { UpdatePseudoDto } from 'src/user/dto/update-pseudo.dto';
import { ApiTags } from "@nestjs/swagger";
import { ChannelService } from 'src/channel/service/channel.service';
import { AcceptChannelInviteDto } from 'src/channel/dto/accept-channel-invite.dto';
import { DeleteChannelInviteDto } from 'src/channel/dto/delete-invite.dto';
import { ParseIntPipe } from "@nestjs/common";

@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly matchService: MatchService,
        private readonly channelService: ChannelService
    ) 
    {}

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get('me')
    findMe(@GetUsername() username): Promise<UserDto>
    {
        return this.userService.findMe(username);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get()
    findAll(): Promise<UserDto[]> {
        console.log('findAllUsers');
        return this.userService.findAll();
    }

    @Get(':userId/invites')
	@UseGuards(TwoFactorGuard)
	async getInvites(@Param('userId', ParseIntPipe) userId: number, @Req() request: Request)
	{
		return await this.channelService.getChannelInvites(request.cookies.username, userId);
	}

	@Patch(':userId/invites')
	@UseGuards(TwoFactorGuard)
	async acceptChannelInvite(
        @Param('userId', ParseIntPipe) userId: number,
        @Req() request: Request,
        @Body() acceptChannelInviteDto: AcceptChannelInviteDto
    )
	{
		await this.channelService.acceptChannelInvite(request.cookies.username, userId, acceptChannelInviteDto);
		return ;
	}

	@Delete(':userId/invites')
	@UseGuards(TwoFactorGuard)
	async deleteChannelInvite(
        @Param('userId', ParseIntPipe) userId: number,
        @Req() request: Request,
        @Body() deleteChannelInviteDto: DeleteChannelInviteDto
    )
	{
		await this.channelService.removeInvitation(request.cookies.username, userId, deleteChannelInviteDto);
		return ;
	}

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string): Promise<UserDto> {
        console.log('findOneUser ', id);
        return this.userService.findOne(id);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get(':id/matchs')
    findAllMatchsByUser(@Param('id', ParseIntPipe) id: string): Promise<MatchDto[]> {
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
    // updateAvatar(@Param('id', ParseIntPipe) id: string, @Body(ValidationPipe) updateAvatarDto: UpdateAvatarDto, @GetUsername() username): Promise<UserDto> {
    //     console.log('updateUser ', id);
        
    //     return this.userService.updateAvatar(username, id, updateAvatarDto);
    // }

    //seulement pour tester
    @Post()
    create(): Promise<User> {
        return this.userService.create();
    }
}
