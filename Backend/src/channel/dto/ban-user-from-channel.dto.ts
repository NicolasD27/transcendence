import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
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
	date: Date;

	// @ApiProperty()
	// @Expose()
    // @IsString()
	// description: string

}