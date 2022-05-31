import { IsOptional, IsEnum, IsNumber, Min } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { MatchStatus } from "../entity/match.entity";

export class UpdateMatchDto {
    @ApiProperty()
    @IsEnum(MatchStatus)
    status: MatchStatus;

    @ApiProperty()
	@IsOptional()
    @IsNumber()
    @Min(0)
    score1?: number;

    @ApiProperty()
	@IsOptional()
    @IsNumber()
    @Min(0)
    score2?: number;
}