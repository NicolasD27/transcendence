import { Controller, Get, Param, ParseIntPipe, Query, Req, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { PaginationQueryDto } from "src/channel/dto/pagination-query.dto";
import { TwoFactorGuard } from "src/guards/two-factor.guard";
import { GetUsername } from "src/user/decorator/get-username.decorator";
import { CreateMsgDto } from "../dto/create-msg.dto";
import { DirectMessageDto } from "../dto/direct-message.dto";
import { DirectMessageService } from "../service/direct-message.service";

@Controller('direct_messages')
@ApiTags('Direct Messages')
export class DirectMessageController {
	constructor (private readonly directMessageService: DirectMessageService) {}


	@Get(':id')
	@UseGuards(TwoFactorGuard)
	async getDirectMessagesFrom(
		@GetUsername() username: string,
		@Query() paginationQuery: PaginationQueryDto,
		@Param('id', ParseIntPipe) id: number,
		@Request() request: Request
	) : Promise<DirectMessageDto[]>
	{
		return this.directMessageService.getDirectMessagesFrom(id.toString(), username, paginationQuery);
	}

}