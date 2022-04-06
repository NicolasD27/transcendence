import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { CustomModes, MatchStatus } from "../entity/match.entity";

export class CreateMatchDto {
    @ApiProperty()
    @IsNumber()
    user1_id: string;

    @ApiProperty()
    @IsNumber()
    user2_id: string;

    @ApiProperty()
    @IsEnum(CustomModes)
    mode: CustomModes;
}