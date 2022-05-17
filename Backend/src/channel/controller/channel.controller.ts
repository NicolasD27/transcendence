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
	Put
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

import { ParseIntPipe } from "@nestjs/common";
import { DeleteChannelInviteDto } from "../dto/delete-invite.dto";
import { AcceptChannelInviteDto } from "../dto/accept-channel-invite.dto";

@ApiTags('Channels')
@Controller('channels/')
export class ChannelController {

	constructor(
		private readonly channelService: ChannelService,
		// private readonly chatGateway: ChatGateway,
	) {}

	@Get('user_invites')			// todo : put this in UserController
	@UseGuards(TwoFactorGuard)
	async getInvites(@Req() request: Request)
	{
		return await this.channelService.getChannelInvites(request.cookies.username);
	}

	@Patch('user_invites')			// todo : put this in UserController
	@UseGuards(TwoFactorGuard)
	async acceptChannelInvite(@Req() request: Request, @Body() acceptChannelInviteDto: AcceptChannelInviteDto)
	{
		await this.channelService.acceptChannelInvite(request.cookies.username, acceptChannelInviteDto);
		return ;
	}

	@Delete('user_invites')			// todo : put this in UserController
	@UseGuards(TwoFactorGuard)
	async deleteChannelInvite(@Req() request: Request, @Body() deleteChannelInviteDto: DeleteChannelInviteDto)
	{
		await this.channelService.removeInvitation(request.cookies.username, deleteChannelInviteDto);
		return ;
	}

	@Get()
	@UseGuards(TwoFactorGuard)
	async findAll()
	{
		return await this.channelService.findAll();
	}

	@Post()
	@UseGuards(TwoFactorGuard)
	async create(@Req() request: Request, @Body() createChannelDto: CreateChannelDto)
	{
		return await this.channelService.create(request.cookies.username, createChannelDto);
	}

	@Get(':id/')
	@UseGuards(TwoFactorGuard)
	async findOne(@Param('id', ParseIntPipe) id: number)
	{
		return this.channelService.findOne(id);
	}

	@Put(':id/')
	@UseGuards(TwoFactorGuard)
	async updatePassword(@Param('id', ParseIntPipe) id: number, @Req() request: Request,
		@Body() updateChannelPassword: UpdateChannelPassword)
	{
		await this.channelService.updatePassword(id.toString(), request.cookies.username, updateChannelPassword);
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
	async remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request, @Body() deleteChannelDto: DeleteChannelDto)
	{
		await this.channelService.remove(id.toString(), request.cookies.username, deleteChannelDto);
		return ;
	}

	// ? Not channel directly

	@Get(':id/users')
	@UseGuards(TwoFactorGuard)
	async getChannelUsers(@Param('id', ParseIntPipe) id: number)
	{
		return this.channelService.getChannelUsers(id.toString());
	}

	@Get(':id/messages')
	@UseGuards(TwoFactorGuard)
	async getChannelMessages(@Param('id', ParseIntPipe) id: number, @Req() request: Request) : Promise<MsgDto[]>
	{
		const username = request.cookies.username;
		console.log(`// getChannelMessages() ${username} ${id}`);

		if (! await this.channelService.checkUserJoinedChannel(username, id.toString()))
			throw new HttpException('channel not joined', HttpStatus.FORBIDDEN);

		return this.channelService.getChannelMessages(id.toString());
	}

	// ? Invites

	@Post(':id/invite')
	@UseGuards(TwoFactorGuard)
	async createChannelInvite(@Req() request: Request, @Body() createChannelInviteDto: CreateChannelInviteDto)
	{
		await this.channelService.saveInvite(request.cookies.username, createChannelInviteDto);
		return ;
	}

	// ? Join / Leave

	@Post(':id/join')
	@UseGuards(TwoFactorGuard)
	async join(@Param('id', ParseIntPipe) id: number, @Req() request: Request, @Body() body: JoinChannelDto)
	{
		await this.channelService.join(request.cookies.username, id.toString(), body.password);
		return ;
	}

	@Delete(':id/leave')
	@UseGuards(TwoFactorGuard)
	async leave(@Param('id', ParseIntPipe) id: number, @Req() request: Request)
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