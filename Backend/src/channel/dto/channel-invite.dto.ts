import { IsPositive, IsNumber } from "@nestjs/class-validator"
import { ApiProperty } from "@nestjs/swagger"
import { Exclude, Expose } from "class-transformer"
import { UserDto } from "src/user/dto/user.dto"
import { ChannelDto } from "./channel.dto"

@Exclude()
export class ChannelInviteDto {
    @ApiProperty()
	@Expose()
    @IsNumber()
	@IsPositive()
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