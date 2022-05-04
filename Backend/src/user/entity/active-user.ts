export class ActiveUsers {

	private users = new Map();

	add(userId: number, socketId: string) {
		console.log(`// ${userId} added to activeUsers by ${socketId}`);
		this.users.set(userId, {socketId: socketId, state: "online"});
	}

	remove(userId: number) {
		console.log(`// removed ${userId} on to activeUsers`);
		this.users.delete(userId);
	}

	getSocketId(userId: number): any {
		return this.users.get(userId);
	}

	get() {
		return this.users;
	}
	
	isActiveUser(userId: number) {
		return (this.users.has(userId));
	}

	updateState(userId: number, state: string) {
		this.users.forEach((val, key) => {
			if (key === userId)
				val.state = state;
		});
	}

	getUserStatus(userId: number): string {
		const found = this.users.get(userId);
		if (!found)
			return "offline";
		return found.state;
	}
}