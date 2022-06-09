import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
	ValidationPipe
} from '@nestjs/common';
import { Request } from 'express';
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';
import { GetUsername } from 'src/user/decorator/get-username.decorator';
import { TwoFactorGuard } from '../../guards/two-factor.guard';
import { AssignCurrentMatch } from '../dto/assign-current-match.dto';
import { CreateMatchDto } from '../dto/create-match.dto';
import { MatchDto } from '../dto/match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
import { Match } from '../entity/match.entity';
import { MatchService } from '../service/match.service';

@Controller('matchs')
export class MatchController {
    constructor(private readonly matchService: MatchService) {
    }

    @UseGuards(TwoFactorGuard)
    @Get()
    findAll(@Query() paginationQuery: PaginationQueryDto): Promise<MatchDto[]> {
        return this.matchService.findAll(paginationQuery);
    }

    @UseGuards(TwoFactorGuard)
    @Get('active')
    findAllActive(@Query() paginationQuery: PaginationQueryDto): Promise<MatchDto[]> {
        return this.matchService.findAllActive(paginationQuery);
    }

    @UseGuards(TwoFactorGuard)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<MatchDto> {
        return this.matchService.findOne(id);
    }

    @UseGuards(TwoFactorGuard)
    @Patch(':id')
    updateMatch(@Param('id') id: string, @Body(ValidationPipe) updateMatchDto: UpdateMatchDto, @GetUsername() username: string): Promise<MatchDto> {        
        return this.matchService.updateMatch(username, id, updateMatchDto);
    }

    @UseGuards(TwoFactorGuard)
    @Post()
    createMatch(@Body(ValidationPipe) createMatchDto: CreateMatchDto): Promise<MatchDto> {
        return this.matchService.createMatch(createMatchDto);
    }

    @UseGuards(TwoFactorGuard)
    @Delete(':id')
    destroyMatch(@Param('id') id: string, @GetUsername() username: string): Promise<MatchDto> {
        return this.matchService.destroyMatch(username, id);
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
