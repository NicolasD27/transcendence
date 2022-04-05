import { IsString, IsNumber, IsNotEmpty } from "class-validator";

export class CreateMsgDto {

	@IsString()
	@IsNotEmpty()
	readonly content: string;

	@IsNumber()
	readonly author: number;
}
