import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as bcrypt from "bcrypt"
import { Exclude } from "class-transformer";

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

    // @OneToOne(type => UserInfo, { eager: true })
    // @JoinColumn()
    // user_info: UserInfo

    // async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    //     return await bcrypt.compare(password, hashedPassword).then(result => result)
    // }
}