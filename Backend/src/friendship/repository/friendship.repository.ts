import { EntityRepository } from "typeorm";
import { AbstractPolymorphicRepository } from 'typeorm-polymorphic'
import { Friendship } from "../entity/friendship.entity";

@EntityRepository(Friendship)
export class FriendshipRepository extends AbstractPolymorphicRepository<
  Friendship
> {}