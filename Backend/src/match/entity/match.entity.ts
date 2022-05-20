import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../../user/entity/user.entity";
import { MatchDto } from "../dto/match.dto";
import { BALL_VX, BALL_VY, GAME_LENGTH, GAME_HEIGHT, GAME_SLEEP } from '../match.constants';

export enum MatchStatus {
    INVITE_SEND,
    MATCH_MAKING,
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

    @Column({ default: GAME_SLEEP})
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

    @Column({ type: "float", default: 0 })
    public room_size: number;

    @Column({ type: "text", default: 0 })
    public winner: string;


    static toDto(match: Match): MatchDto {
		const dto: MatchDto = {
            id: match.id,
            status: match.status,
            user1: User.toDto(match.user1),
            user2: User.toDto(match.user2),
            score1: match.score1,
            score2: match.score2,
            mode: match.mode,
            date: match.date,
            sleep: match.sleep,
            room_size: match.room_size,
            winner: match.winner
        }
        return dto
	}
}
