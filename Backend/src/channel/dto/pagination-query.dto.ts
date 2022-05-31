import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto
{
	@ApiProperty()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	limit: number;

	@ApiProperty()
	@IsOptional()
	@Type(() => Number)
	@IsNumber()
	@Min(0)
	offset: number;
}