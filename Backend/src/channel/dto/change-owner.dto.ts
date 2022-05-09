import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString, MaxLength } from "class-validator";

@Exclude()
export class ChangeChannelOwnerDto
{
	@ApiProperty()
	@Expose()
    @IsNumber()
	readonly userId: number;

	@ApiProperty()
	@Expose()
	@IsString()
	@MaxLength(32)
	readonly password: string;
}