import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as bcrypt from "bcrypt"
import { Exclude } from "class-transformer";
import { Friendship } from "src/friendship/entity/friendship.entity";

export enum Status {
    OFFLINE,
    ONLINE,
    SEARCHING,
    PLAYING

}

@Entity()
@Unique(['username'])

export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "varchar" })
    username: string

    // @Column({ type: "varchar" })
    // password: string

    // @Column()
    // salt: string

    @Column({ nullable: true })
    @Exclude()
    public hashedRefreshToken?: string

    @Column({ nullable: true })
    twoFactorAuthSecret?: string

    @Column({ default: false })
    public isTwoFactorEnable: boolean

    @Column({ nullable: true })
    avatar: string

    @Column({ default: Status.ONLINE })
    status: number

    @OneToMany(() => Friendship, friendship => friendship.follower)
    followers: Friendship[];

    @OneToMany(() => Friendship, friendship => friendship.following)
    followings: Friendship[];

    // async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    //     return await bcrypt.compare(password, hashedPassword).then(result => result)
    // }
}