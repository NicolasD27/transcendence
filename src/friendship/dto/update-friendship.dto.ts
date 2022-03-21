import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Max, Min } from "class-validator";
import { FriendshipStatus } from "../entity/friendship.entity";

export class updateFriendshipDto {
    @ApiProperty()
    @Min(1)
    @Max(3)
    status: number
}