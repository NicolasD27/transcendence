import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthenticatedGuard } from "src/guards/authenticated.guard";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { ChannelService } from "./service/channel.service";
import { Request } from "express";	// ? without this we can't access cookies
import { ApiTags } from "@nestjs/swagger";
import { Msg } from "src/chat/entity/msg.entity";
import { GetUser } from "src/user/decorator/get-user.decorator";

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
	@Get(':id/join')
	async join(@GetUser() user, @Param('id') id: string)
	{
		return this.channelService.join(user.username, id);
	}

	// @UseGuards(AuthenticatedGuard)
	@Get(':id/users')
	async getChannelUsers(@Param('id') id: string)
	{
		return this.channelService.getChannelUsers(id);
	}

	// @UseGuards(AuthenticatedGuard)
	@Get(':id/messages')
	async getMessages(@Param('id') id: string) : Promise<Msg[]> {

		console.log(`getting Messages on channel ${id}`);
		// todo : need to check if password has been sent once

		return this.channelService.getMessages(id);
	}

	// @UseGuards(AuthenticatedGuard)
	@Post()
	async create(@Req() request: Request, @Body() createChannelDto: CreateChannelDto) {
		return this.channelService.create(request.cookies.username, createChannelDto);
	}

}