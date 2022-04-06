import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString, Max, Min, IsEnum } from "class-validator";
import { UserDto } from "src/user/dto/user.dto";
import { FriendshipStatus } from "../entity/friendship.entity";

@Exclude()
export class FriendshipDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    id: number

    @ApiProperty()
    @Expose()
    @IsEnum(FriendshipStatus)
    status: number

    @ApiProperty()
    @Expose()
    follower: UserDto;
    
    @ApiProperty()
    @Expose()
    following: UserDto;
}