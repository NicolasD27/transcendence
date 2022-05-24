import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationQueryDto
{
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	limit: number;

	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(1)
	offset: number;
}