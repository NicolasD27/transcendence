import { IsString, MaxLength } from "@nestjs/class-validator";

export class UpdateChannelPassword {

	@IsString()
	@MaxLength(32)
	readonly previousPassword: string;

	@IsString()
	@MaxLength(32)
	readonly newPassword: string;
}