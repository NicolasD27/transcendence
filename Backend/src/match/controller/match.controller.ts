import { Body, Controller, Get, Param, Patch, Post, Req,  Session, UseGuards, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { TwoFactorGuard } from '../../guards/two-factor.guard';
import { AssignCurrentMatch } from '../dto/assign-current-match.dto';
import { CreateMatchDto } from '../dto/create-match.dto';
import { MatchDto } from '../dto/match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { Match } from '../entity/match.entity';
import { MatchService } from '../service/match.service';
// import * as session from 'express-session';

@Controller('matchs')
export class MatchController {
    constructor(private readonly matchService: MatchService) {
    }

    @UseGuards(TwoFactorGuard)
    @Get()
    findAll(): Promise<MatchDto[]> {
        return this.matchService.findAll();
    }

    @UseGuards(TwoFactorGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<MatchDto> {
        return this.matchService.findOne(id);
    }

    @UseGuards(TwoFactorGuard)
    @Patch(':id')
    updateMatch(@Param('id') id: string, @Body(ValidationPipe) updateMatchDto: UpdateMatchDto, @Req() req): Promise<MatchDto> {        
        return this.matchService.updateMatch(req.user.username, id, updateMatchDto);
    }

    @UseGuards(TwoFactorGuard)
    @Post()
    createMatch(@Body(ValidationPipe) createMatchDto: CreateMatchDto): Promise<MatchDto> {
        return this.matchService.createMatch(createMatchDto);
    }

    // @UseGuards(TwoFactorGuard)
    // @Post('matchmaking')
    // matchmaking(@Req() req): Promise<MatchDto> {
    //     return this.matchService.matchmaking(req.user.username);
    // }

    // @UseGuards(TwoFactorGuard)
    // @Post('/current')
    // aassignCurrentMatch(@Body(ValidationPipe) assignCurrentMatch: AssignCurrentMatch): Promise<MatchDto> {
    //     return this.matchService.assignCurrentMatch(assignCurrentMatch);
    // }
}
