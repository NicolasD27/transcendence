import { User } from "src/user/entity/user.entity";
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";

@Entity()
export class Msg {
	@PrimaryGeneratedColumn()
	public id: number;
	
	@Column()
	public content: string;
	
	@ManyToOne(() => User, user => user.messages)	// when real users will be used
	user: User;
}
