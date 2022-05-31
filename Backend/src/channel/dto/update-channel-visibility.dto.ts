import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class UpdateChannelDto {

	@ApiProperty()
	@Expose()
	@IsString()
	@MaxLength(32)
	readonly previousPassword: string;

	@ApiProperty()
	@Expose()
	@IsBoolean()
	readonly isProtected: boolean;

	@ApiProperty()
	@IsOptional()
	@Expose()
	@IsString()
	@MinLength(1)
	@MaxLength(32)
	@Matches(/[\x20-\x7E]/, { message: 'You can only use ASCII characters' })
	readonly newPassword?: string;
}