import { IsString, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from "@nestjs/class-validator";

export class CreateChannelDto {

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@MaxLength(64)
	readonly name: string;

	@ApiProperty()
	@IsString()
	// @MinLength(0)
	@MaxLength(200)
	readonly description: string;

	@ApiProperty()
	@IsString()
	// @MinLength(0)
	@MaxLength(32)
	// @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
	readonly password: string;

	@ApiProperty()
	@IsBoolean()
	readonly isPrivate: boolean;
}
