import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, Min } from "class-validator";
import {  MatchStatus } from "../entity/match.entity";

export class UpdateMatchDto {
    @ApiProperty()
    @IsEnum(MatchStatus)
    status: MatchStatus;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    score1: number;

    @ApiProperty()
    @IsNumber()
    @Min(0)
    score2: number;
}