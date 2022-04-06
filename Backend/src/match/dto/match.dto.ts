import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNumber, IsString } from "class-validator";
import { UserDto } from "src/user/dto/user.dto";
import { CustomModes, MatchStatus } from "../entity/match.entity";

export class MatchDto {
    @ApiProperty()
    @IsNumber()
    id: number;

    @ApiProperty()
    user1: UserDto;

    @ApiProperty()
    user2: UserDto;

    @ApiProperty()
    @IsNumber()
    score1: number;

    @ApiProperty()
    @IsNumber()
    score2: number;

    @ApiProperty()
    @IsDate()
    date: Date;

    @ApiProperty()
    @IsEnum(MatchStatus)
    status: MatchStatus;

    @ApiProperty()
    @IsEnum(CustomModes)
    mode: CustomModes;
}