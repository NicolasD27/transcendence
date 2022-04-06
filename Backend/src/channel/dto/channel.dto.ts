import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsNotEmpty } from "class-validator";
import { UserDto } from "src/user/dto/user.dto";

export class ChannelDto {

	@ApiProperty()
    @IsNumber()
	id: number

	@ApiProperty()
    @IsString()
	name: string

	@ApiProperty()
    @IsString()
	description: string

	@ApiProperty()
	owner: UserDto

}
