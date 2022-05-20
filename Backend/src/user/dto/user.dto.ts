import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsString, IsEnum, IsNumber, IsBoolean } from "class-validator";
import { UserStatus } from "../entity/user.entity";

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