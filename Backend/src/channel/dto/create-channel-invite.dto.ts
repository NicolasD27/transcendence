import { IsPositive } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNumber } from "class-validator";

export class CreateChannelInviteDto {

	@ApiProperty()
	@ApiProperty()
	@Expose()
    @IsNumber()
	@IsPositive()
	channelId:number;

	@ApiProperty()
	@ApiProperty()
	@Expose()
    @IsNumber()
	@IsPositive()
	userId:number;

}
