import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { UserDto } from "src/user/dto/user.dto";
import { CustomModes, MatchStatus } from "../entity/match.entity";

@Exclude()
export class MatchDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    id: number;

    @ApiProperty()
    @Expose()
    user1: UserDto;

    @ApiProperty()
    @Expose()
    user2: UserDto;

    @ApiProperty()
    @Expose()
    @IsNumber()
    score1: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    score2: number;

    @ApiProperty()
    @Expose()
    @IsDate()
    date: Date;

    @ApiProperty()
    @Expose()
    @IsEnum(MatchStatus)
    status: MatchStatus;

    @ApiProperty()
    @Expose()
    @IsEnum(CustomModes)
    mode: CustomModes;

    @ApiProperty()
    @Expose()
    @IsNumber()
    sleep: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    room_size: number;

    @ApiProperty()
    @Expose()
    @IsNumber()
    winner: string;

}