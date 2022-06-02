import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsString, IsNumber, IsNotEmpty } from "class-validator";
import { UserDto } from "src/user/dto/user.dto";

@Exclude()
export class ChannelDtoWithModeration {

	@ApiProperty()
	@Expose()
	@IsNumber()
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

	@ApiProperty()
	@Expose()
	moderators: UserDto[];

	@ApiProperty()
	@Expose()
	restricted: UserDto[];

}
