import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { ChannelService } from "./service/channel.service";
import { Request } from "express";	// ? without this we can't access cookies
import { ApiTags } from "@nestjs/swagger";
import { CreateMsgDto } from "src/chat/dto/create-msg.dto";
import { JoinChannelDto } from "./dto/join-channel.dto";

@ApiTags('Channels')
@Controller('channels/')
export class ChannelController {
	constructor (private readonly channelService: ChannelService) {}

	// @UseGuards(AuthenticatedGuard)
	@Get()
	async findAll() {
		// const user = await this.channel
		return this.channelService.findAll();
	}

	// @UseGuards(AuthenticatedGuard)
	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.channelService.findOne(id);
	}

	// @UseGuards(AuthenticatedGuard)
	@Get(':id/users')
	async getChannelUsers(@Param('id') id: string)
	{
		return this.channelService.getChannelUsers(id);
	}

	// @UseGuards(AuthenticatedGuard)
	@Get(':id/messages')
	async getChannelMessages(@Param('id') id: string) : Promise<CreateMsgDto[]> {
		
		console.log(`getting Messages on channel ${id}`);
		// todo : need to check if password has been sent once
		
		return this.channelService.getChannelMessages(id);
	}

	// @UseGuards(AuthenticatedGuard)
	@Post()
	async create(@Req() request: Request, @Body() createChannelDto: CreateChannelDto) {
		return this.channelService.create(request.cookies.username, createChannelDto);
	}

	// @UseGuards(AuthenticatedGuard)
	@Post(':id/join')
	async join(@Req() request: Request, @Param('id') id: string, @Body() body: JoinChannelDto) //@GetUser() user
	{
		// return this.channelService.join(user.username, id);
		return this.channelService.join(request.cookies.username, id, body.password);
	}

}