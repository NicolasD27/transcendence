export class ActiveUsers {

	private users = new Map();

	add(userId: number, socketId: string) {
		console.log(`// ${userId} added to activeUsers by ${socketId}`);
		this.users.set(Number(userId), {socketId: socketId, state: "online"});
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

	updateState(userId: number, state: string) {
		this.users.forEach((val, key) => {
			if (key === Number(userId))
				val.state = state;
		});
	}

	getUserStatus(userId: number): string {
		const found = this.users.get(Number(userId));
		if (!found)
			return "offline";
		return found.state;
	}

	display(userId: number)
	{
		console.log(userId);
		console.log(this.users);
		console.log("display has userId : " + this.users.has(Number(userId)));
		console.log(typeof(userId));
	}
}