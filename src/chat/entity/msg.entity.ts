import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Msg {
	@PrimaryGeneratedColumn()
	public id: number;
	
	@Column()
	public content: string;
	
	// ManyToOne(() => User)	// when real users will be used
	@Column()
	public author: number;
}
