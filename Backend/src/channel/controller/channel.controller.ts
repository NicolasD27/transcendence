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
	HttpCode,
	BadRequestException
} from "@nestjs/common";
import { CreateChannelDto } from "../dto/create-channel.dto";
import { ChannelService } from "../service/channel.service";
import { Request } from "express";	// ? without this we can't access cookies
import { ApiTags } from "@nestjs/swagger";
import { JoinChannelDto } from "../dto/join-channel.dto";
import { TwoFactorGuard } from "src/guards/two-factor.guard";
import { MsgDto } from "src/message/dto/message.dto";
import { UpdateChannelPassword } from "../dto/update-channel-password.dto";
import { DeleteChannelDto } from "../dto/delete-channel.dto";
import { ChangeChannelOwnerDto } from "../dto/change-owner.dto";
import { CreateChannelInviteDto } from "../dto/create-channel-invite.dto";

@ApiTags('Channels')
@Controller('channels/')
export class ChannelController {

	constructor(
		private readonly channelService: ChannelService,
		// private readonly chatGateway: ChatGateway,
	) {}

	@Post()
	@UseGuards(TwoFactorGuard)
	async create(@Req() request: Request, @Body() createChannelDto: CreateChannelDto)
	{
		const newChannel = await this.channelService.create(request.cookies.username, createChannelDto);
		return newChannel;
	}

	@Get()
	@UseGuards(TwoFactorGuard)
	async findAll()
	{
		return this.channelService.findAll();
	}

	@Get(':id')
	@UseGuards(TwoFactorGuard)
	async findOne(@Param('id') id: number)
	{
		return this.channelService.findOne(id);
	}

	// ! sending a letter breaks it (error 500)
	@Get(':id/users')
	@UseGuards(TwoFactorGuard)
	async getChannelUsers(@Param('id') id: string)
	{
		return this.channelService.getChannelUsers(id);
	}

	@Get(':id/messages')
	@UseGuards(TwoFactorGuard)
	async getChannelMessages(@Param('id') id: string, @Req() request: Request) : Promise<MsgDto[]>
	{
		const username = request.cookies.username;
		console.log(`// getChannelMessages() ${username} ${id}`);

		if (! await this.channelService.checkUserJoinedChannel(username, id))
			throw new HttpException('channel not joined', HttpStatus.FORBIDDEN);

		return this.channelService.getChannelMessages(id);
	}

	// ? Invites

	@Get('invites')
	@UseGuards(TwoFactorGuard)
	async getInvites(@Req() request: Request)
	{
		return this.channelService.getChannelInvites(request.cookies.username);
	}

	@Post(':id/invite')
	async createChannelInvite(@Req() request: Request, @Body() createChannelInviteDto: CreateChannelInviteDto)
	{
		return this.channelService.saveInvite(request.cookies.username, createChannelInviteDto);
	}

	@Delete(':id/invite')
	async deleteChannelInvite(@Req() request: Request, @Body() createChannelInviteDto: CreateChannelInviteDto)
	{
		// ! remove the invitation if in the 'id' row the receiver is the current user
	}

	@Post(':id/join')
	@UseGuards(TwoFactorGuard)
	async join(@Param('id') id: string, @Req() request: Request, @Body() body: JoinChannelDto)
	{
		await this.channelService.join(request.cookies.username, id, body.password);
		return true;
	}

	// todo : maybe use a Patch here ?
	@Patch(':id/leave')
	@UseGuards(TwoFactorGuard)
	async leave(@Param('id') id: string, @Req() request: Request)
	{
		await this.channelService.leave(request.cookies.username, id);
		return true;
	}

	@Patch(':id/')
	@UseGuards(TwoFactorGuard)
	async updatePassword(@Param('id') id: string, @Req() request: Request, @Body() updateChannelPassword: UpdateChannelPassword)
	{
		await this.channelService.updatePassword(id, request.cookies.username, updateChannelPassword);
		return true;
	}

	@Post(':channelID/moderators/:userID')
	@UseGuards(TwoFactorGuard)
	async giveModoToUser(
						@Param('channelID') channelID: string,
						@Param('userID') userID: string,
						@Req() request: Request,
						)
	{
		await this.channelService.giveModerationRights(channelID, request.cookies.username, userID, true);
		return ;
	}

	@Delete(':channelID/moderators/:userID')
	@UseGuards(TwoFactorGuard)
	async declineModoToUser(
		@Param('channelID') channelID: string,
		@Param('userID') userID: string,
		@Req() request: Request,
		)
	{
		await this.channelService.giveModerationRights(channelID, request.cookies.username, userID, false);
		return ;
	}

	// todo : getBannedUsers && getMutedUsers
	// todo : getModerators

	@Patch(':id/')
	@UseGuards(TwoFactorGuard)
	async changeOwner(@Param('id') id: string, @Req() request: Request, @Body() changeChannelOwnerDto:ChangeChannelOwnerDto)
	{
		await this.channelService.changeOwner(id, request.cookies.username, changeChannelOwnerDto);
		return ;
	}

	@Delete(':id/')
	@UseGuards(TwoFactorGuard)
	async remove(@Param('id') id: string, @Req() request: Request, @Body() deleteChannelDto: DeleteChannelDto)
	{
		await this.channelService.remove(id, request.cookies.username, deleteChannelDto);
		return ;
	}

}