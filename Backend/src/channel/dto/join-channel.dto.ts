
import { IsString, MaxLength, MinLength } from "class-validator";

export class JoinChannelDto {
	@IsString()
	@MinLength(0)
	@MaxLength(32)
	readonly password: string;
}
