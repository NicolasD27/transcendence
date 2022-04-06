import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Request, UseFilters, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { createFriendshipDto } from '../dto/create-friendship.dto';
import { FriendshipDto } from '../dto/friendship.dto';
import { updateFriendshipDto } from '../dto/update-friendship.dto';
import { Friendship } from '../entity/friendship.entity';
import { FriendshipService } from '../service/friendship.service';

@Controller('friendships')
// @UseFilters(HttpExceptionFilter)
export class FriendshipController {
    constructor(private readonly friendshipService: FriendshipService) {}

    @UseGuards(AuthenticatedGuard)
    @Get(':user_id')
    findAllByUser(@Param('user_id') user_id: string): Promise<FriendshipDto[]> {
        console.log('findAllFriendshipsByUser', user_id);
        return this.friendshipService.findAllByUser(user_id);
    }

    @UseGuards(AuthenticatedGuard)
    @Post()
    create(@Body() body: createFriendshipDto): Promise<FriendshipDto> {
        console.log('createFriendship');
        if (body.user1_id == body.user2_id)
            throw new BadRequestException("One can't be friend with oneself")
        else if (+body.user1_id <= 0 || +body.user2_id <= 0)
            throw new BadRequestException("id is a not positive integer")
        return this.friendshipService.create(body);
    }

    @UseGuards(AuthenticatedGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body(ValidationPipe) body: updateFriendshipDto, @Request() req): Promise<FriendshipDto> {
        console.log('updateFriendship', id);
        return this.friendshipService.update(req.user.username, id, body.status);
    }

    //pour supprimer les invitations (status == 0)
    @UseGuards(AuthenticatedGuard)
    @Delete(':id')
    async destroy(@Param('id') id: string, @Request() req): Promise<FriendshipDto> {
        console.log('destroyFriendship', id);
        return this.friendshipService.destroy(req.user.username,id);
    }

}
