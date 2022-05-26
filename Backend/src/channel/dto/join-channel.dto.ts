import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from "@nestjs/class-validator";

export class JoinChannelDto {
	@ApiProperty()
	@IsString()
	@IsOptional()
	@MinLength(0)
	@MaxLength(32)
	readonly password?: string;
}
