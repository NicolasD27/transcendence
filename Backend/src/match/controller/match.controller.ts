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
	ValidationPipe,
	ParseIntPipe
} from '@nestjs/common';
import { PaginationQueryDto } from 'src/channel/dto/pagination-query.dto';
import { GetUsername } from 'src/user/decorator/get-username.decorator';
import { TwoFactorGuard } from '../../guards/two-factor.guard';
import { CreateMatchDto } from '../dto/create-match.dto';
import { MatchDto } from '../dto/match.dto';
import { UpdateMatchDto } from '../dto/update-match.dto';
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
    findOne(@Param('id', ParseIntPipe) id: number): Promise<MatchDto> {
        return this.matchService.findOne(id.toString());
    }

    @UseGuards(TwoFactorGuard)
    @Patch(':id')
    updateMatch(
		@Param('id', ParseIntPipe) id: number,
		@Body(ValidationPipe) updateMatchDto: UpdateMatchDto,
		@GetUsername() username: string
	): Promise<MatchDto> {        
        return this.matchService.updateMatch(username, id.toString(), updateMatchDto);
    }

    @UseGuards(TwoFactorGuard)
    @Post()
    createMatch(
		@Body(ValidationPipe) createMatchDto: CreateMatchDto
	): Promise<MatchDto> {
        return this.matchService.createMatch(createMatchDto);
    }

    @UseGuards(TwoFactorGuard)
    @Delete(':id')
    destroyMatch(
		@Param('id', ParseIntPipe) id: number,
		@GetUsername() username: string
	): Promise<MatchDto> {
        return this.matchService.destroyMatch(username, id.toString());
    }

}
