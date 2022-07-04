import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    UseFilters,
    UseGuards,
    ValidationPipe
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { TwoFactorGuard } from 'src/guards/two-factor.guard';
import { GetUsername } from 'src/user/decorator/get-username.decorator';
import { createFriendshipDto } from '../dto/create-friendship.dto';
import { FriendshipDto } from '../dto/friendship.dto';
import { FriendshipService } from '../service/friendship.service';
import { ParseIntPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Friendships')
@Controller('friendships')
@UseFilters(HttpExceptionFilter)
export class FriendshipController {
    constructor(private readonly friendshipService: FriendshipService) { }

	@ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Get(':user_id')
    findAllByUser(@Param('user_id', ParseIntPipe) user_id: number): Promise<FriendshipDto[]> {
        return this.friendshipService.findAllByUser(user_id.toString());
    }

	@ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post()
    create(@Body(ValidationPipe) body: createFriendshipDto): Promise<FriendshipDto> {
        if (body.user1_id == body.user2_id)
            throw new BadRequestException("One can't be friend with oneself")
        else if (+body.user1_id <= 0 || +body.user2_id <= 0)
            throw new BadRequestException("id is a not positive integer")
        return this.friendshipService.create(body);
    }

	@ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Post(':id/block')
    block(@Param('id', ParseIntPipe) id: string, @GetUsername() username): Promise<FriendshipDto> {
        return this.friendshipService.block(username, +id);
    }

    //pour supprimer les invitations (status == 0)
	@ApiBearerAuth()
    @UseGuards(TwoFactorGuard)
    @Delete(':id')
    async destroy(@Param('id', ParseIntPipe) id: number, @GetUsername() username): Promise<FriendshipDto> {
        return this.friendshipService.destroy(username, id.toString());
    }

}
