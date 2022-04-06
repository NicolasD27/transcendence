import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsString, IsNumber, IsNotEmpty } from "class-validator";
import { UserDto } from "src/user/dto/user.dto";

@Exclude()
export class ChannelDto {

	@ApiProperty()
	@Expose()
    @IsNumber()
	id: number

	@ApiProperty()
	@Expose()
    @IsString()
	name: string

	@ApiProperty()
	@Expose()
    @IsString()
	description: string

	@ApiProperty()
	@Expose()
	owner: UserDto

}
