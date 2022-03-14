import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserInfo extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    
}