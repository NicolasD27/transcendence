import { Channel } from "../entity/channel.entity";
import { Msg } from "../../message/entity/msg.entity";
import { ChannelDto } from "../dto/channel.dto";
import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Req,
	UseGuards,
	HttpException,
	HttpStatus
} from "@nestjs/common";
import { CreateChannelDto } from "../dto/create-channel.dto";
import { ChannelService } from "../service/channel.service";
import { Request } from "express";	// ? without this we can't access cookies
import { ApiTags } from "@nestjs/swagger";
import { JoinChannelDto } from "../dto/join-channel.dto";
import { GetUsername } from "src/user/decorator/get-username.decorator";
import { TwoFactorGuard } from "src/guards/two-factor.guard";
import { CreateMsgDto } from "src/message/dto/create-msg.dto";
import { MsgDto } from "src/message/dto/message.dto";
import { UpdateChannelPassword } from "../dto/update-channel-password.dto";

@ApiTags('Channels')
@Controller('channels/')
export class ChannelController {
	constructor (private readonly channelService: ChannelService) {}

	@Get()
	@UseGuards(TwoFactorGuard)
	async findAll() {
		// const user = await this.channel
		return this.channelService.findAll();
	}

	@Get(':id')
	@UseGuards(TwoFactorGuard)
	async findOne(@Param('id') id: string) {
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
		
		// todo: use something esle than cookies
		const username = request.cookies.username;
		console.log(`// getChannelMessages() ${username} ${id}`);

		if (! await this.channelService.checkUserJoinedChannel(username, id))
			throw new HttpException('channel not joined', HttpStatus.FORBIDDEN);

		return this.channelService.getChannelMessages(id);
	}

	@Post()
	@UseGuards(TwoFactorGuard)
	async create(@Req() request: Request, @Body() createChannelDto: CreateChannelDto) {
		return this.channelService.create(request.cookies.username, createChannelDto);
	}

	@Post(':id/join')
	@UseGuards(TwoFactorGuard)
	async join(@Req() request: Request, @Param('id') id: string, @Body() body: JoinChannelDto) //@GetUser() user
	{
		// return this.channelService.join(user.username, id);
		return this.channelService.join(request.cookies.username, id, body.password);
	}

	@Get(':id/leave')
	@UseGuards(TwoFactorGuard)
	async leave(@Req() request: Request, @Param('id') id: string)
	{
		await this.channelService.leave(request.cookies.username, id);
		return ;
	}

	@Post(':id/updatePassword')
	@UseGuards(TwoFactorGuard)
	async updatePassword(@Req() request: Request, @Param('id') id: string, @Body() updateChannelPassword: UpdateChannelPassword)
	{
		await this.channelService.updatePassword(id, request.cookies.username, updateChannelPassword);
	}

}