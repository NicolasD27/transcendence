import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsPositive, IsString } from "class-validator";
import { User } from "src/user/entity/user.entity";

@Exclude()
export class BanUserFromChannelDto
{

	@ApiProperty()
	@Expose()
    @IsNumber()
	userId: number;

	@ApiProperty()
	@Expose()
	@IsNumber()
	@IsPositive()
	timeout: number;	// in second

	// @ApiProperty()
	// @Expose()
    // @IsString()
	// description: string

}