import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as bcrypt from "bcrypt"
import { Exclude } from "class-transformer";
import { User } from "src/user/entity/user.entity";

export enum FriendshipStatus {
    PENDING,
    ACTIVE,
    BLOCKED_BY_1,
    BLOCKED_BY_2

}

@Entity()
export class Friendship extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ default: FriendshipStatus.PENDING })
    status: number

    @ManyToOne(() => User, user => user.followers, { eager: true })
    follower: User;

    @ManyToOne(() => User, user => user.followings, { eager: true })
    following: User;

    

    
}