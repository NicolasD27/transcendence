import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { CustomModes, MatchStatus } from "../entity/match.entity";

export class AssignCurrentMatch {
    @ApiProperty()
    @IsString()
    match_id: string;

    @ApiProperty()
    @IsString()
    user1_id: string;

    @ApiProperty()
    @IsString()
    user2_id: string;
}