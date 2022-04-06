import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Max, Min, IsEnum } from "class-validator";
import { UserDto } from "src/user/dto/user.dto";
import { FriendshipStatus } from "../entity/friendship.entity";

export class FriendshipDto {
    @ApiProperty()
    @IsNumber()
    id: number

    @ApiProperty()
    @IsEnum(FriendshipStatus)
    status: number

    @ApiProperty()
    follower: UserDto;
    
    @ApiProperty()
    following: UserDto;
}