<<<<<<< HEAD
import { IsString, IsNumber, IsNotEmpty } from "class-validator";
=======
import { IsString, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from "@nestjs/class-validator";
>>>>>>> master

export class CreateChannelDto {

	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@IsString()
	readonly description: string;

<<<<<<< HEAD
=======
	@ApiProperty()
	@IsString()
	// @MinLength(0)
	@MaxLength(32)
	// @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
	readonly password: string;

	@ApiProperty()
	@IsBoolean()
	readonly isPrivate: boolean;
>>>>>>> master
}
