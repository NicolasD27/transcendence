import { User } from "src/user/entity/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { BALL_VX, BALL_VY } from "../match.constants";

export enum MatchStatus {
    INVITE_SEND,
    ACTIVE,
    FINISHED
}

export enum CustomModes {
    NORMAL,
    CUSTOM
}

@Entity()
export class Match {
	@PrimaryGeneratedColumn()
	public id: number;
	
	@ManyToOne(() => User, user => user.matchs1, { eager: true })	// when real users will be used
	public user1: User;

    @ManyToOne(() => User, user => user.matchs2, { eager: true })	// when real users will be used
	public user2: User;

    @Column({ default: 3})
    public sleep: number;

    @Column({ default: 0})
    public score1: number;

    @Column({ default: 0})
    public score2: number;


    @Column({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP' ,
        type: 'timestamp',
      })
    public date: Date;

    @Column({ default: MatchStatus.INVITE_SEND })
    public status: MatchStatus;

    @Column({ default: CustomModes.NORMAL })
    public mode: number;

    @Column({ default: 50 })
    public y1: number;

    @Column({ default: 50 })
    public y2: number;

    @Column({ default: 100 })
    public bx: number;

    @Column({ default: 50 })
    public by: number;

    @Column({ default: BALL_VX })
    public bvx: number;

    @Column({ default: BALL_VY })
    public bvy: number;
}