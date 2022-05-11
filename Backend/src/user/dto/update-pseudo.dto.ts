import { Min } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class UpdatePseudoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Length(1, 20)
    pseudo: string
}