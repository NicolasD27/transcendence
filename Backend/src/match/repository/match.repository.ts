import { EntityRepository } from "typeorm";
import { AbstractPolymorphicRepository } from 'typeorm-polymorphic'
import { Match } from "../entity/match.entity";

@EntityRepository(Match)
export class MatchRepository extends AbstractPolymorphicRepository<
  Match
> {}