import { Controller, Get, Param } from '@nestjs/common';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/service/user/user.service';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {

    }

    @Get()
    findAll(): Promise<User[]> {
        return this.userService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id: string): Promise<User> {
        return this.userService.findOne(id);
    }
}
