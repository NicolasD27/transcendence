import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UpdatePseudoDto {
    @ApiProperty()
    @IsString()
    pseudo: string
}