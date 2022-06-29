import { IsOptional, IsEnum, IsNumber, Min } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { MatchStatus } from "../entity/match.entity";

export class FinishedMatchDto {
	@ApiProperty()
	@IsEnum(MatchStatus)
	status: MatchStatus;

	@ApiProperty()
	@IsOptional()
	@IsString()
	winner?: string;
}