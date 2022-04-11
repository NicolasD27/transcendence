import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Participation } from '../entity/participation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ParticipationService {
	constructor(
		@InjectRepository(Participation)
		private participationRepo: Repository<Participation>,
	) {}

	async findOne(ParticipationId: string): Promise<Participation>
	{
		const myParticipation = await this.participationRepo.findOne(ParticipationId);
		if (!myParticipation)
			throw new NotFoundException();
		return myParticipation;
	}
}