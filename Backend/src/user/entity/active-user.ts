import { UserStatus } from "../utils/user-status";

export class ActiveUsers {

	private users = new Map();

	add(userId: number, socketId: string) {
		//console.log(`// ${userId} added to activeUsers by ${socketId}`);
		this.users.set(Number(userId), { socketId: socketId, state: UserStatus.ONLINE });
	}

	remove(userId: number) {
		this.users.delete(Number(userId));
	}

	getSocketId(userId: number) {
		return this.users.get(Number(userId));
	}

	get() {
		return this.users;
	}

	isActiveUser(userId: number) {
		return (this.users.has(Number(userId)));
	}

	updateState(userId: number, state: UserStatus) {
		// need to optimise this
		this.users.forEach((val, key) => {
			if (key === Number(userId))
				val.state = state;
		});
	}

	getUserStatus(userId: number): UserStatus {
		const found = this.users.get(Number(userId));
		if (!found)
			return UserStatus.OFFLINE;
		return found.state;
	}

	display() {
		//console.log(this.users);
	}
}