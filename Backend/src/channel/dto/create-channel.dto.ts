import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsBoolean, Matches, IsOptional, MinLength } from "@nestjs/class-validator";

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
	@IsOptional()
	@IsString()
	@MinLength(1)
	@MaxLength(32)
	@Matches(/[\x20-\x7E]/, { message: 'You can only use ASCII characters' })
	readonly password?: string;
}
