import { IsString, IsNumber, IsNotEmpty } from "class-validator";

export class CreateChannelDto {

	@IsString()
	@IsNotEmpty()
	readonly name: string;

	@IsString()
	readonly description: string;

}
