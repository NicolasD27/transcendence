import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString, Max, Min, IsEnum } from "class-validator";
import { FriendshipDto } from "src/friendship/dto/friendship.dto";
import { Friendship } from "src/friendship/entity/friendship.entity";
import { MatchDto } from "src/match/dto/match.dto";
import { UserDto } from "src/user/dto/user.dto";

@Exclude()
export class NotificationDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    id: number

    @ApiProperty()
    @Expose()
    receiver: UserDto;
    
    @ApiProperty()
    @Expose()
    name: string

    @ApiProperty()
    @Expose()
    entityType: string;

    @ApiProperty()
    @Expose()
    entityId: number;

    @ApiProperty()
    @Expose()
    awaitingAction: boolean;

    
}