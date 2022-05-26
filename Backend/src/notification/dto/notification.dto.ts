import { IsOptional, IsNumber } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
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
    senderId: number

    @ApiProperty()
    @Expose()
    entityType: string;

    @ApiProperty()
    @Expose()
    entityId: number;

    @ApiProperty()
    @Expose()
    awaitingAction: boolean;

    @ApiProperty()
	@IsOptional()
    @Expose()
    secondName?: string;

}