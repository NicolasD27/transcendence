import { MinLength, IsNumber, IsString, MaxLength, IsPositive, IsOptional } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ChangeChannelOwnerDto
{
	@ApiProperty()
	@Expose()
    @IsNumber()
	@IsPositive()
	readonly userId: number;

	@ApiProperty()
	@Expose()
	@IsString()
	@MinLength(1)
	@MaxLength(32)
	@IsOptional()
	readonly password?: string;
}