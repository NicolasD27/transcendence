import { Body, Controller, Get, Param, Patch, Post, Request, Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthenticatedGuard } from 'src/guards/authenticated.guard';
import { UpdateAvatarDto } from 'src/user/dto/update-avatar.dto';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/service/user/user.service';
import { CreateMatchDto } from '../dto/create-match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { Match } from '../entity/match.entity';
import { MatchService } from '../service/match.service';
// import * as session from 'express-session';

@Controller('matchs')
export class MatchController {
    constructor(private readonly matchService: MatchService) {
    }

    @UseGuards(AuthenticatedGuard)
    @Get()
    findAll(): Promise<Match[]> {
        console.log('findAllUsers',);
        return this.matchService.findAll();
    }

    @UseGuards(AuthenticatedGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<Match> {
        console.log('findOneUser ', id);
        return this.matchService.findOne(id);
    }

    @UseGuards(AuthenticatedGuard)
    @Patch(':id')
    updateMatch(@Param('id') id: string, @Body(ValidationPipe) updateMatchDto: UpdateMatchDto, @Request() req): Promise<Match> {
        console.log('updateUser ', id);
        
        return this.matchService.updateMatch(req.user.username, id, updateMatchDto);
    }

    @UseGuards(AuthenticatedGuard)
    @Post()
    createMatch(@Body(ValidationPipe) createMatchDto: CreateMatchDto): Promise<Match> {
        return this.matchService.createMatch(createMatchDto);
    }
}
