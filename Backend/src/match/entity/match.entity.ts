import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { User } from "../../user/entity/user.entity";
import { MatchDto } from "../dto/match.dto";
import { Notification } from "src/notification/entity/notification.entity";
import { PolymorphicChildren } from "typeorm-polymorphic"
import { ActiveUsers } from "src/user/entity/active-user";

export enum MatchStatus {
    INVITE_SENT,
    MATCH_MAKING,
    ACTIVE,
    FINISHED
}

export enum CustomModes {
    NORMAL,
    CUSTOM
}

@Entity("matchs")
export class Match {
	@PrimaryGeneratedColumn()
	public id: number;

	@ManyToOne(() => User, user => user.matchs1, { eager: true })	// when real users will be used
	public user1: User;

    @ManyToOne(() => User, user => user.matchs2, { eager: true })	// when real users will be used
	public user2: User;

    @PolymorphicChildren(() => Notification)
    notification: Notification;

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

    @Column({ default: MatchStatus.INVITE_SENT })
    public status: MatchStatus;

    @Column({ default: CustomModes.NORMAL })
    public mode: number;

    @Column({ type: "float", default: 0 })
    public room_size: number;

    @Column({ type: "text", default: 0 })
    public winner: string;


    static toDto(match: Match, _activeUsers: ActiveUsers): MatchDto {
		let u2 = null;
		if (match.user2)
			u2 = User.toDto(match.user2, _activeUsers);
		const dto: MatchDto = {
            id: match.id,
            status: match.status,
            user1: User.toDto(match.user1, _activeUsers),
            user2: u2, //User.toDto(match.user2, _activeUsers),
            score1: match.score1,
            score2: match.score2,
            mode: match.mode,
            date: match.date,
            room_size: match.room_size,
            winner: match.winner
        }
        return dto
	}
}
