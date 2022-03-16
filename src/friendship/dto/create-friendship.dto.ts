import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class createFriendshipDto {
    @ApiProperty()
    @IsNumber()
    user1_id: number

    @ApiProperty()
    @IsNumber()
    user2_id: number
}