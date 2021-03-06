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
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
import { ParseIntPipe } from "@nestjs/common";
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';
import { ApiFile } from 'src/user/decorator/api-file.decorator';
import { fileMimetypeFilter } from 'src/user/utils/fileFilter';

@ApiTags('Users')
@Controller('users')
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly matchService: MatchService,
        private readonly channelService: ChannelService
    ) { }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get('me')
    findMe(@GetUsername() username): Promise<UserDto> {
        return this.userService.findMe(username);
    }

    @Get('me/channels')
    @UseGuards(TwoFactorGuard)
    async findJoinedChannels(@Req() request: Request) {
        //console.log('me/channels');
        return await this.channelService.getJoinedChannels(request.cookies.username);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get('count')
    async countUsers(): Promise<number> {
        //console.log('findOneUser ', id);
        return await this.userService.getUserCount();
    }

    @ApiQuery({
        name: "search",
        type: String,
        required: false
    })
    @UseGuards(TwoFactorGuard)
    @Get()
    findAll(
        @Query() paginationQueryDto?: PaginationQueryDto,
        @Query('search') search?: string,
    ): Promise<UserDto[]> {
        //console.log('findAllUsers');
        if (search && search.length)
            return this.userService.searchForUsers(paginationQueryDto, search);
        return this.userService.findAll(paginationQueryDto);
    }

	@ApiBearerAuth()
    @Get(':userId/invites')
    @UseGuards(TwoFactorGuard)
    async getInvites(
        @Query() paginationQueryDto: PaginationQueryDto,
        @Param('userId', ParseIntPipe) userId: number,
        @Req() request: Request
    ) {
        return this.channelService.getChannelInvites(request.cookies.username,
            userId, paginationQueryDto);
    }

	@ApiBearerAuth()
    @Patch(':userId/invites/:inviteId')
    @UseGuards(TwoFactorGuard)
    async acceptChannelInvite(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('inviteId', ParseIntPipe) inviteId: number,
        @Req() request: Request,
    ) {
        await this.channelService.acceptChannelInvite(request.cookies.username, userId, inviteId);
        return;
    }

	@ApiBearerAuth()
    @Delete(':userId/invites/:inviteId')
    @UseGuards(TwoFactorGuard)
    async deleteChannelInvite(
        @Param('userId', ParseIntPipe) userId: number,
        @Req() request: Request,
        @Param('inviteId', ParseIntPipe) inviteId: number
    ) {
        await this.channelService.removeInvitation(request.cookies.username, userId, inviteId);
        return;
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get(':id/matchs')
    findAllMatchsByUser(
        @Query() paginationQueryDto: PaginationQueryDto,
        @Param('id', ParseIntPipe) id: string
    ): Promise<MatchDto[]> {
        return this.matchService.findAllMatchsByUser(id, paginationQueryDto);
    }

    // ? checking the file size/myme type at the bottome of :
    // ? https://wanago.io/2021/11/08/api-nestjs-uploading-files-to-server/
    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post('avatar')
    @ApiFile('avatar', true, { fileFilter: fileMimetypeFilter('image') })
    @UseInterceptors(FileInterceptor('file'))
    async addAvatar(@GetUsername() username, @UploadedFile() file: Express.Multer.File) {
        //console.log("uploading img**************")
        return this.userService.addAvatar(username, file.buffer, file.originalname);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post('pseudo')
    @UseInterceptors(FileInterceptor('file'))
    async changePseudo(@GetUsername() username, @Body() updatePseudoDto: UpdatePseudoDto) {
        return this.userService.changePseudo(username, updatePseudoDto);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get('blocked')
    async getBlockedUsers(@GetUsername() username) {
		// console.log("blocked ", username)
        return this.userService.getBlockedUsers(username);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get('blocked/:id')
    async isBlocked(@Param('id', ParseIntPipe) id: string, @GetUsername() username) {
        return this.userService.isBlocked(username, +id);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get('blockers')
    async getBlockersUsers(@GetUsername() username) {
		// console.log("blockers ", username)
        return this.userService.getBlockersUsers(username);
    }

    @ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: string): Promise<UserDto> {
        //console.log('findOneUser ', id);
        return this.userService.findOne(id);
    }

}
