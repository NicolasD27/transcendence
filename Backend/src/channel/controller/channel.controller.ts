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
	Patch
} from "@nestjs/common";
import { CreateChannelDto } from "../dto/create-channel.dto";
import { ChannelService } from "../service/channel.service";
import { Request } from "express";	// ? without this we can't access cookies
import { ApiTags } from "@nestjs/swagger";
import { JoinChannelDto } from "../dto/join-channel.dto";
import { TwoFactorGuard } from "src/guards/two-factor.guard";
import { MsgDto } from "src/message/dto/message.dto";
import { UpdateChannelPassword } from "../dto/update-channel-password.dto";
import { BanUserFromChannelDto } from "../dto/ban-user-from-channel.dto";
import { DeleteChannelDto } from "../dto/delete-channel.dto";
import { ChangeChannelOwnerDto } from "../dto/change-owner.dto";

@ApiTags('Channels')
@Controller('channels/')
export class ChannelController {
	constructor (private readonly channelService: ChannelService) {}

	@Get()
	@UseGuards(TwoFactorGuard)
	async findAll()
	{
		return this.channelService.findAll();
	}

	@Get(':id')
	@UseGuards(TwoFactorGuard)
	async findOne(@Param('id') id: string)
	{
		return this.channelService.findOne(id);
	}

	@Get(':id/users')
	@UseGuards(TwoFactorGuard)
	async getChannelUsers(@Param('id') id: string)
	{
		return this.channelService.getChannelUsers(id);
	}

	@Get(':id/messages')
	@UseGuards(TwoFactorGuard)
	async getChannelMessages(@Param('id') id: string, @Req() request: Request) : Promise<MsgDto[]> { // @GetUsername() username: string

		const username = request.cookies.username;
		console.log(`// getChannelMessages() ${username} ${id}`);

		if (! await this.channelService.checkUserJoinedChannel(username, id))
			throw new HttpException('channel not joined', HttpStatus.FORBIDDEN);

		return this.channelService.getChannelMessages(id);
	}

	@Post()
	@UseGuards(TwoFactorGuard)
	async create(@Req() request: Request, @Body() createChannelDto: CreateChannelDto) {
		const newChannel = await this.channelService.create(request.cookies.username, createChannelDto);
		return newChannel;
	}

	@Post(':id/join')
	@UseGuards(TwoFactorGuard)
	async join(@Param('id') id: string, @Req() request: Request, @Body() body: JoinChannelDto) //@GetUser() user
	{
		this.channelService.join(request.cookies.username, id, body.password);
		return ;
	}

	// todo : maybe use a Patch here ?
	@Get(':id/leave')
	@UseGuards(TwoFactorGuard)
	async leave(@Param('id') id: string, @Req() request: Request)
	{
		await this.channelService.leave(request.cookies.username, id);
		return ;
	}

	@Patch(':id/updatePassword')
	@UseGuards(TwoFactorGuard)
	async updatePassword(@Param('id') id: string, @Req() request: Request, @Body() updateChannelPassword: UpdateChannelPassword)
	{
		await this.channelService.updatePassword(id, request.cookies.username, updateChannelPassword);
		return ;
	}

	// todo banUser() && unbanUser()
	@Patch(':id/ban')
	@UseGuards(TwoFactorGuard)
	async banUser(@Param('id') id: string, @Req() request: Request, @Body() banUserFromChannelDto: BanUserFromChannelDto)
	{
		await this.channelService.changeBanStatus(id, request.cookies.username, banUserFromChannelDto, "banned");
		return ;
	}

	@Patch(':id/changeOwner')
	@UseGuards(TwoFactorGuard)
	async changeOwner(@Param('id') id: string, @Req() request: Request, @Body() changeChannelOwnerDto:ChangeChannelOwnerDto)
	{
		await this.channelService.changeOwner(id, request.cookies.username, changeChannelOwnerDto);
		return ;
	}

	@Delete(':id/delete')
	@UseGuards(TwoFactorGuard)
	async remove(@Param('id') id: string, @Req() request: Request, @Body() deleteChannelDto: DeleteChannelDto)
	{
		await this.channelService.remove(id, request.cookies.username, deleteChannelDto);
		return ;
	}

	// todo : giveModoToUser() && removeModoToUser()
	// todo : muteUser && unMuteUser
	// todo : getBannedUsers && getMutedUsers

}