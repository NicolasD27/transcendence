import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class DeleteChannelDto
{
	@ApiProperty()
	@IsString()
	@MaxLength(32)
	readonly name: string;
}
