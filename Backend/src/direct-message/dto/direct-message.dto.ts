import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsString, IsEnum, IsNumber, IsDate } from "class-validator";
import { ChannelDto } from "src/channel/dto/channel.dto";
import { UserDto } from "src/user/dto/user.dto";

@Exclude()
export class DirectMessageDto {
    @ApiProperty()
	@Expose()
    @IsNumber()
	id: number

	

	@ApiProperty()
	@Expose()
    @IsString()
	content: string

    @ApiProperty()
	@Expose()
    @IsDate()
	date: Date

    @ApiProperty()
	@Expose()
	sender: UserDto

	@ApiProperty()
	@Expose()
	receiver: UserDto
}