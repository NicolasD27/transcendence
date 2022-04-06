import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdateAvatarDto {
    @ApiProperty()
    @IsString()
    avatar: string
}