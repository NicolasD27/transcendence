import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString, Max, Min, IsEnum } from "class-validator";
import { UserDto } from "src/user/dto/user.dto";

@Exclude()
export class NotificationDto {
    @ApiProperty()
    @Expose()
    @IsNumber()
    id: number

    @ApiProperty()
    @Expose()
    entityId: number;
    
    @ApiProperty()
    @Expose()
    entityType: string;

    @ApiProperty()
    @Expose()
    receiver: UserDto;
}