import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsBoolean, MinLength, Matches } from "@nestjs/class-validator";

export class CreateChannelDto {

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	readonly name: string;

	@ApiProperty()
	@IsBoolean()
	readonly isPrivate: boolean;

	@ApiProperty()
	@IsBoolean()
	readonly isProtected: boolean;

	@ApiProperty()
	@IsString()
	// @MinLength(1)
	@MaxLength(32)
	// todo: test this regex :
	// @Matches(/[\x20-\x7E]/, { message: 'You can only use ASCII characters' })
	readonly password?: string;
}
