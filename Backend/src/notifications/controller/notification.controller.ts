import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Request, UseFilters, UseGuards, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { TwoFactorGuard } from 'src/guards/two-factor.guard';
import { GetUsername } from 'src/user/decorator/get-username.decorator';
import { NotificationDto } from '../dto/notification.dto';
import { NotificationService } from '../service/notification.service';


@Controller('notifications')
@UseFilters(HttpExceptionFilter)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @UseGuards(TwoFactorGuard)
    @Get(':user_id')
    findAllByUser(@Param('user_id') user_id: string): Promise<NotificationDto[]> {
        console.log('findAllNotificationsByUser', user_id);
        return this.notificationService.findAllByUser(user_id);
    }

    @UseGuards(TwoFactorGuard)
    @Delete(':id')
    async destroy(@Param('id') id: string, @GetUsername() username): Promise<NotificationDto> {
        console.log('destroyNotification', id);
        return this.notificationService.destroy(username,id);
    }

}
