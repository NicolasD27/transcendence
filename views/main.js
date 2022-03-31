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
		opponent_id: 2,
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
		match: []
	},
	methods: {
		connectToChannel() {
			this.room = '1';
			this.socket.emit('connect_to_channel', {room: this.room})
		},
		sendMessage() {
			if(this.validateInput()) {
				const message = {
					activeChannelId: 3,
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
			let msgs = await (await fetch('http://localhost:3000/api/channels/1/messages')).json();	// chat/id of the channel
			for (let i = 0; i < msgs.length; ++i) {
				this.receivedMessage(msgs[i]);
			}
		},
		// async findMatch() {
		// 	const match = await (await fetch('http://e2r10p7:3000/api/matchs/matchmaking')).json();
		// },
		connectToMatch() {
			// this.room = 'a';
			this.socket.emit('connect_to_match', {opponent_id: this.opponent_id})
		},
		
		sendUp() {
			this.socket.emit('update_to_server', {match_id: this.match.id, command: 'up'});
		},
		sendDown() {
			this.socket.emit('update_to_server', {match_id: this.match.id, command: 'down'});
		},
		receiveUpdateMatch(match) {
			this.match = match
			console.log(this.match)
		}
	},
	created() {
		console.log("here", document.cookie.split('=')[1])
		this.socket = io.connect('http://localhost:3000', this.socketOptions);
		this.socket.on('msg_to_client', (message) => {
			this.receivedMessage(message)
		});
		
		this.socket.on('update_to_client', (match) => {
			this.receiveUpdateMatch(match)
		});
		
	}
});

app.getPreviousMessages();

