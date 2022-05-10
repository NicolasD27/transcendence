export class ActiveUsers {

	private user = new Map();

	add(userId: number, socketId: string) {
		console.log(`// ${userId} added to activeUsers by ${socketId}`);
		this.user.set(userId, {socketId: socketId, state: "online"});
	}

	remove(userId: number) {
		console.log(`// removed ${userId} on to activeUsers`);
		this.user.delete(userId);
	}

	getSocketId(userId: number): any {
		return this.user.get(userId);
	}
	
	get() {
		return this.user;
	}
	
	isActiveUser(userId: number) {
		return (this.user.has(userId));
	}

	updateState(userId: number, state: string) {
		this.user.forEach((val, key) => {
			if (key === userId)
				val.state = state;
		});
	}

	getUserStatus(userId: number): string {
		const found = this.user.get(userId);
		if (!found)
			return "offline";
		return found.state;
	}
}