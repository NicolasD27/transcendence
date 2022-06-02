import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Req,
	UseGuards,
	HttpException,
	HttpStatus,
	Delete,
	Patch,
	Put,
	Query
} from "@nestjs/common";
import { CreateChannelDto } from "../dto/create-channel.dto";
import { ChannelService } from "../service/channel.service";
import { Request } from "express";	// ? without this we can't access cookies
import { ApiTags } from "@nestjs/swagger";
import { JoinChannelDto } from "../dto/join-channel.dto";
import { TwoFactorGuard } from "src/guards/two-factor.guard";
import { MsgDto } from "src/message/dto/message.dto";
import { DeleteChannelDto } from "../dto/delete-channel.dto";
import { ChangeChannelOwnerDto } from "../dto/change-owner.dto";
import { ParseIntPipe } from "@nestjs/common";
import { PaginationQueryDto } from "../dto/pagination-query.dto";
import { UpdateChannelDto } from "../dto/update-channel-visibility.dto";

@ApiTags('Channels')
@Controller('channels/')
export class ChannelController {

	constructor(
		private readonly channelService: ChannelService,
		// private readonly chatGateway: ChatGateway,
	) {}

	@Get()
	@UseGuards(TwoFactorGuard)
	async findAll(
		@Query('search') search: string,
		@Query() paginationQuery: PaginationQueryDto
	)
	{
		if (search && search.length)
			return await this.channelService.searchForChannel(paginationQuery, search);
		return await this.channelService.findAll(paginationQuery);
	}

	@Post()
	@UseGuards(TwoFactorGuard)
	async create(
		@Req() request: Request,
		@Body() createChannelDto: CreateChannelDto
	)
	{
		return await this.channelService.create(request.cookies.username, createChannelDto);
	}

	@Get(':id/')
	@UseGuards(TwoFactorGuard)
	async findOne(
		@Param('id', ParseIntPipe) id: number,
		@Req() request: Request
	)
	{
		return this.channelService.findOneWithModerators(request.cookies.username, id);
	}

	@Put(':id/')
	@UseGuards(TwoFactorGuard)
	async updateProtection(
		@Param('id', ParseIntPipe) id: number,
		@Req() request: Request,
		@Body() updateChannelDto: UpdateChannelDto
	)
	{
		await this.channelService.updateChannelProtection(
			id.toString(),
			request.cookies.username,
			updateChannelDto
		);
		return ;
	}

	@Patch(':id/')
	@UseGuards(TwoFactorGuard)
	async changeOwner(
		@Param('id', ParseIntPipe) id: number,
		@Req() request: Request,
		@Body() changeChannelOwnerDto:ChangeChannelOwnerDto
	)
	{
		await this.channelService.changeOwner(id.toString(), request.cookies.username, changeChannelOwnerDto);
		return ;
	}

	@Delete(':id/')
	@UseGuards(TwoFactorGuard)
	async remove(
		@Param('id', ParseIntPipe) id: number,
		@Req() request: Request,
		@Body() deleteChannelDto: DeleteChannelDto
	)
	{
		await this.channelService.remove(id.toString(), request.cookies.username, deleteChannelDto);
		return ;
	}

	// ? Not channel directly

	@Get(':id/users')
	@UseGuards(TwoFactorGuard)
	async getChannelUsers(
		@Query() paginationQuery: PaginationQueryDto,
		@Param('id', ParseIntPipe) id: number
	)
	{
		return this.channelService.getChannelUsers(id.toString(), paginationQuery);
	}

	@Get(':id/messages')
	@UseGuards(TwoFactorGuard)
	async getChannelMessages(
		@Query() paginationQuery: PaginationQueryDto,
		@Param('id', ParseIntPipe) id: number,
		@Req() request: Request
	) : Promise<MsgDto[]>
	{
		if (! await this.channelService.checkUserJoinedChannel(request.cookies.username, id.toString()))
			throw new HttpException('channel not joined', HttpStatus.FORBIDDEN);
		return this.channelService.getChannelMessages(id.toString(), paginationQuery);
	}

	// ? Join / Leave

	@Post(':id/join')
	@UseGuards(TwoFactorGuard)
	async join(
		@Param('id', ParseIntPipe) id: number,
		@Req() request: Request,
		@Body() body: JoinChannelDto
	)
	{
		await this.channelService.join(request.cookies.username, id.toString(), body.password);
		return ;
	}

	@Delete(':id/leave')
	@UseGuards(TwoFactorGuard)
	async leave(
		@Param('id', ParseIntPipe) id: number,
		@Req() request: Request
	)
	{
		await this.channelService.leave(request.cookies.username, id.toString());
		return ;
	}

	// ? moderators

	@Post(':channelID/moderators/:userID')
	@UseGuards(TwoFactorGuard)
	async giveModoToUser(
		@Param('channelID', ParseIntPipe) channelID: string,
		@Param('userID', ParseIntPipe) userID: string,
		@Req() request: Request,
	)
	{
		await this.channelService.giveModerationRights(channelID, request.cookies.username, userID, true);
		return ;
	}

	@Delete(':channelID/moderators/:userID')
	@UseGuards(TwoFactorGuard)
	async declineModoToUser(
		@Param('channelID', ParseIntPipe) channelID: number,
		@Param('userID', ParseIntPipe) userID: number,
		@Req() request: Request,
	)
	{
		await this.channelService.giveModerationRights(
			channelID.toString(),
			request.cookies.username,
			userID.toString(),
			false
		);
		return ;
	}

	// todo : getBannedUsers && getMutedUsers
	// todo : getModerators
}