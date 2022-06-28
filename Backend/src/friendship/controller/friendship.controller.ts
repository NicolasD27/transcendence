import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
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
import { updateFriendshipDto } from '../dto/update-friendship.dto';
import { FriendshipService } from '../service/friendship.service';
import { ParseIntPipe } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Friendships')
@Controller('friendships')
@UseFilters(HttpExceptionFilter)
export class FriendshipController {
    constructor(private readonly friendshipService: FriendshipService) {}

    @UseGuards(TwoFactorGuard)
    @Get(':user_id')
    findAllByUser(@Param('user_id') user_id: string): Promise<FriendshipDto[]> {
        //console.log('findAllFriendshipsByUser', user_id);
        return this.friendshipService.findAllByUser(user_id);
    }

    @UseGuards(TwoFactorGuard)
    @Post()
    create(@Body(ValidationPipe) body: createFriendshipDto): Promise<FriendshipDto> {
        //console.log('createFriendship');
        if (body.user1_id == body.user2_id)
            throw new BadRequestException("One can't be friend with oneself")
        else if (+body.user1_id <= 0 || +body.user2_id <= 0)
            throw new BadRequestException("id is a not positive integer")
        return this.friendshipService.create(body);
    }

    @UseGuards(TwoFactorGuard)
    @Post(':id/block')
    block(@Param('id', ParseIntPipe) id: string, @GetUsername() username): Promise<FriendshipDto> {
        console.log("*****$hello")
        return this.friendshipService.block(username, +id);
    }

    @UseGuards(TwoFactorGuard)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: string, @Body(ValidationPipe) body: updateFriendshipDto, @GetUsername() username): Promise<FriendshipDto> {
        //console.log('updateFriendship', id);
        return this.friendshipService.update(username, +id, body.status);
    }

    //pour supprimer les invitations (status == 0)
    @UseGuards(TwoFactorGuard)
    @Delete(':id')
    async destroy(@Param('id', ParseIntPipe) id: string, @GetUsername() username): Promise<FriendshipDto> {
        //console.log('destroyFriendship', id);
        return this.friendshipService.destroy(username,id);
    }

}
