import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { CustomModes, MatchStatus } from "../entity/match.entity";

export class CreateMatchDto {
    @ApiProperty()
    @IsNumber()
    user1_id: number;

    @ApiProperty()
    @IsNumber()
    user2_id: number;

    @ApiProperty()
    @IsEnum(CustomModes)
    mode: CustomModes;
}