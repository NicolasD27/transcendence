function getAccessTokenFromCookies() {
	try {
		return ('bearer ' + document.cookie.split('; ')
						.find((cookie) => cookie.startsWith('accessToken'))
						.split('=')[1]);
	} catch (ex) {
		return '';
	}
}

const app = new Vue({
	el: '#app',
	data: {
		title: 'Nestjs Websockets Chat',
		author: '',
		content: '',
		messages: [],
		match: {},
		room: '',
		socket: null,
		socketOptions: {
			transportOptions: {
				polling: {
					extraHeaders: {
						Authorization: getAccessTokenFromCookies()
					}
				}
			}
		},
		opponent_id: null,
		invite_choosen: null,
		invites: [],
		match: []
	},
	methods: {
		connectToChannel() {
			this.room = 'a';
			this.socket.emit('connect_to_channel', {room: this.room})
		},
		sendMessage(message) {
			console.log(message);
			if(this.validateInput()) {
				const message = {
					content: this.content,
					author: this.author
				}
				this.socket.emit('msg_to_server', message)
			}
			this.content = '';
		},
		receivedMessage(message) {
			this.messages.push(message);
		},
		validateInput() {
			// return this.author.length > 0 && this.content.length > 0;	// need to be done server side too
			return true;
		},

		async getPreviousMessages() {
			let msgs = await (await fetch('http:// localhost:3000/api/channels/1')).json();	// chat/id of the channel
			for (let i = 0; i < msgs.length; ++i) {
				this.receivedMessage(msgs[i]);
			}
		},
		// async findMatch() {
		// 	const match = await (await fetch('http://e2r10p7:3000/api/matchs/matchmaking')).json();
		// },
		connectToMatch() {
			// this.room = 'a';
			this.socket.emit('connect_to_match', {opponent_id: this.opponent_id});
		},
		findMatch() {
			console.log("searching for a match...")
			this.socket.emit('find_match', {});
		},
		challengeUser() {
			console.log("challenging user #", this.opponent_id)
			this.socket.emit('challenge_user', {opponent_id: this.opponent_id});
		},
		acceptChallenge() {
			console.log("accept challenge #", this.invite_choosen)
			if (this.invite_choosen >= 0 && this.invite_choosen < this.invites.length)
				this.socket.emit('accept_challenge', {match_id: this.invites[this.invite_choosen].id})
		},
		receiveMatchInvite(match) {
			console.log("receiving invite... ", match)
			this.invites.push(match);
		},
		launchMatch(match) {
			this.match = match;
			console.log("launching match : ", match);
		},
		sendUp() {
			this.socket.emit('update_to_server', {match_id: this.match.id, command: 'up'});
		},
		sendDown() {
			this.socket.emit('update_to_server', {match_id: this.match.id, command: 'down'});
		},
		receiveUpdateMatch(match) {
			this.match = match;
			console.log(this.match);
		}
	},
	created() {
		console.log("here", document.cookie.split('=')[1])
		this.socket = io.connect('http://localhost:3000', this.socketOptions);
		this.socket.emit('connect_to_match', {room: 'a'})
		this.socket.on('msg_to_client', (message) => {
			this.receivedMessage(message);
		});

		this.socket.on('update_to_client', (match) => {
			this.receiveUpdateMatch(match);
		});
		this.socket.on('match_invite_to_client', (match) => {
			this.receiveMatchInvite(match);
		});
		this.socket.on('launch_match', (match) => {
			this.launchMatch(match);
		});

	}
});

app.getPreviousMessages();

//here