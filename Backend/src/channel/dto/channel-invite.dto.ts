import { ApiProperty } from "@nestjs/swagger"
import { Exclude, Expose } from "class-transformer"
import { IsNumber } from "class-validator"
import { UserDto } from "src/user/dto/user.dto"
import { ChannelDto } from "./channel.dto"

@Exclude()
export class ChannelInviteDto {
    @ApiProperty()
	@Expose()
    @IsNumber()
	id: number

	@ApiProperty()
	@Expose()
	channel: ChannelDto

    @ApiProperty()
	@Expose()
	sender: UserDto

	@ApiProperty()
	@Expose()
	receiver: UserDto
}