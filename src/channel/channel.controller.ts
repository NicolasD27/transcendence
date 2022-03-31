import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AuthenticatedGuard } from "src/guards/authenticated.guard";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { ChannelService } from "./service/channel.service";
import { Request } from "express";	// ? without this we can't access cookies
import { ApiTags } from "@nestjs/swagger";
import { Channel } from "./entity/channel.entity";
import { Msg } from "src/chat/entity/msg.entity";
import { string } from "joi";

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
	async findOne(@Param() id: string) {
		return this.channelService.findOne(id);
	}

	// @UseGuards(AuthenticatedGuard)
	@Get(':id/messages')
	async getMessages(@Param() id: string) : Promise<Msg[]> {

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