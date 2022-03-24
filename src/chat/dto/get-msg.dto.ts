import { IsString, IsNumber, IsNotEmpty } from "class-validator";
import { User } from "src/user/entity/user.entity";

export class MsgWithUser {

	@IsString()
	@IsNotEmpty()
	readonly content: string;

	@IsNumber()
	readonly user: User;
}