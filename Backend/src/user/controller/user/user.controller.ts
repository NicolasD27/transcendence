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
    ValidationPipe,
	Query
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
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';

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
    findAll(
		@Query('search') search: string,
		@Query() paginationQueryDto: PaginationQueryDto,
	): Promise<UserDto[]>
	{
        console.log('findAllUsers');
		if (search && search.length)
			return this.userService.searchForUsers(paginationQueryDto, search);
        return this.userService.findAll(paginationQueryDto);
    }

    @Get(':userId/invites')
	@UseGuards(TwoFactorGuard)
	async getInvites(
		@Query() paginationQueryDto: PaginationQueryDto,
		@Param('userId', ParseIntPipe) userId: number,
		@Req() request: Request
	)
	{
		return this.channelService.getChannelInvites(request.cookies.username,
			userId, paginationQueryDto);
	}

	@Patch(':userId/invites/:inviteId')
	@UseGuards(TwoFactorGuard)
	async acceptChannelInvite(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('inviteId', ParseIntPipe) inviteId: number,
        @Req() request: Request,
    )
	{
		await this.channelService.acceptChannelInvite(request.cookies.username, userId, inviteId);
		return ;
	}

	@Delete(':userId/invites/:inviteId')
	@UseGuards(TwoFactorGuard)
	async deleteChannelInvite(
        @Param('userId', ParseIntPipe) userId: number,
        @Req() request: Request,
        @Param('inviteId', ParseIntPipe) inviteId: number
    )
	{
		await this.channelService.removeInvitation(request.cookies.username, userId, inviteId);
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
    findAllMatchsByUser(
		@Query() paginationQueryDto: PaginationQueryDto,
		@Param('id', ParseIntPipe) id: string
	): Promise<MatchDto[]>
	{
        return this.matchService.findAllMatchsByUser(id, paginationQueryDto);
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
