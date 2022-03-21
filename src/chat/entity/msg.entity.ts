import { User } from "src/user/entity/user.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
export class Msg {
	@PrimaryGeneratedColumn()
	public id: number;
	
	@Column()
	public content: string;
	
	@ManyToOne(() => User, user => user.messages)	// when real users will be used
	user: User;
}
