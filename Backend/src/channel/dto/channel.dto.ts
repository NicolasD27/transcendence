import { IsString, IsNumber, IsPositive } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { UserDto } from "src/user/dto/user.dto";

@Exclude()
export class ChannelDto {

	@ApiProperty()
	@Expose()
	@IsNumber()
	@IsPositive()
	id: number

	@ApiProperty()
	@Expose()
	// todo: add a decorator
	isPrivate: boolean

	@ApiProperty()
	@Expose()
	// todo: add a decorator
	isProtected: boolean

	@ApiProperty()
	@Expose()
	@IsString()
	name: string;

	@ApiProperty()
	@Expose()
	owner: UserDto;

}
