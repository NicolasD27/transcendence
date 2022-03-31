import { IsString, IsNumber, IsNotEmpty } from "class-validator";

export class CreateMsgDto {

	// todo : add date

	@IsString()
	@IsNotEmpty()
	readonly content: string;

	@IsNumber()
	readonly author: number;
}
