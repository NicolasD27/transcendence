import { EntityRepository } from "typeorm";
import { AbstractPolymorphicRepository } from 'typeorm-polymorphic'
import { Notification } from "../entity/notification.entity";

@EntityRepository(Notification)
export class NotificationRepository extends AbstractPolymorphicRepository<
  Notification
> {}