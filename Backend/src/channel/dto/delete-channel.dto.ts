import { IsString, MaxLength, MinLength } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class DeleteChannelDto
{
	@ApiProperty()
	@IsString()
	@MinLength(1)
	@MaxLength(32)
	readonly name: string;
}
