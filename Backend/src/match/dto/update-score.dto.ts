import { IsOptional, IsEnum, IsNumber, Min } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { MatchStatus } from "../entity/match.entity";

export class UpdateScoreDto {

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	@Min(0)
	score1: number;

	@ApiProperty()
	@IsOptional()
	@IsNumber()
	@Min(0)
	score2: number;


}