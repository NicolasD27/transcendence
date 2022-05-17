import { IsNumber, IsPositive } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from "@nestjs/class-validator";
import { Exclude, Expose } from "class-transformer";

export class AcceptChannelInviteDto
{
	@ApiProperty()
    @Expose()
	@IsNumber()
	@IsPositive()
	readonly inviteId: number;
}
