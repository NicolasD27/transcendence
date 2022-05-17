
import { IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class JoinChannelDto {
	@ApiProperty()
	@IsString()
	@MinLength(0)
	@MaxLength(32)
	readonly password: string;
}
