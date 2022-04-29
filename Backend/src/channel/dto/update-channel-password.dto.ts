import { IsString, MaxLength } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class UpdateChannelPassword {

	@ApiProperty()
	@Expose()
	@IsString()
	@MaxLength(32)
	readonly previousPassword: string;

	@ApiProperty()
	@Expose()
	@IsString()
	@MaxLength(32)
	readonly newPassword: string;
}