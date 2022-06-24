import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional } from "class-validator";
import { UserStatus } from "../utils/user-status";

@Exclude()
export class UserDto {
    @ApiProperty()
	@Expose()
    @IsNumber()
	id: number

	@ApiProperty()
	@Expose()
    @IsString()
	username: string

	@ApiProperty()
	@Expose()
    @IsString()
	pseudo: string

	@ApiProperty()
	@Expose()
    @IsNumber()
	@IsOptional()
	avatarId?: number

	@ApiProperty()
	@Expose()
    @IsEnum(UserStatus)
	status: number

	@ApiProperty()
	@Expose()
    @IsBoolean()
	isTwoFactorEnable: boolean

}