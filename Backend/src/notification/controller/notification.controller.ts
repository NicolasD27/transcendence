import {  Controller, Delete, Get, Param, Query, UseFilters, UseGuards } from '@nestjs/common';
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { TwoFactorGuard } from 'src/guards/two-factor.guard';
import { GetUsername } from 'src/user/decorator/get-username.decorator';
import { NotificationDto } from '../dto/notification.dto';
import { Notification } from '../entity/notification.entity';
import { NotificationService } from '../service/notification.service';


@Controller('notifications')
@UseFilters(HttpExceptionFilter)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @UseGuards(TwoFactorGuard)
    @Get(':user_id')
    findAllByUser(
		@Query() paginationQuery: PaginationQueryDto,
		@Param('user_id') user_id: string
	): Promise<NotificationDto[]>
	{
        //console.log('findAllNotificationsByUser', user_id);
        return  this.notificationService.findAllByUser(user_id, paginationQuery);
    }

    @UseGuards(TwoFactorGuard)
    @Delete(':id')
    async destroy(@Param('id') id: string, @GetUsername() username): Promise<Notification> {
        //console.log('destroyNotification', id);
        return this.notificationService.destroy(username,id);
    }

}
