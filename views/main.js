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
						Authorization: 'bearer ' + document.cookie.split('; ')
							.find((cookie) => cookie.startsWith('accessToken'))
							.split('=')[1],
					}
				}
			}
		},
		match: []
	},
	methods: {
		sendMessage() {
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
		async getPrevousMessages() {
			let msgs = await (await fetch('http://localhost:3000/channels/1')).json();	// chat/id of the channel
			for (let i = 0; i < msgs.length; ++i) {
				this.receivedMessage(msgs[i]);
			}
		},
		connectToMatch() {
			this.room += 'a';
			this.socket.emit('connect_to', {room: this.room})
		},
		
		sendUp() {
			this.socket.emit('update_to_server', {room: this.room, command: 'up'});
		},
		sendDown() {
			this.socket.emit('update_to_server', {room: this.room, command: 'down'});
		},
		receiveUpdateMatch(match) {
			this.match = match
			console.log(this.match)
		}
	},
	created() {
		console.log("here", document.cookie.split('=')[1])
		this.socket = io.connect('http://localhost:3000', this.socketOptions); //, socketOptions);
		this.socket.on('msg_to_client', (message) => {
			this.receivedMessage(message)
		});
		
		this.socket.on('update_to_client', (match) => {
			this.receiveUpdateMatch(match)
		});
	}
});

// app.getPrevousMessages();
