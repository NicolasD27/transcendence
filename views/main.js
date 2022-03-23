const app = new Vue({
	el: '#app',
	data: {
		title: 'Nestjs Websockets Chat',
		author: '',
		content: '',
		messages: [],
		socket: null,
		socketOptions: {
			transportOptions: {
				polling: {
					extraHeaders: {
						Authorization: 'my token',
					}
				}
			}
		},
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
		}
	},
	created() {
		this.socket = io.connect('http://localhost:3000'); //, socketOptions);
		this.socket.on('msg_to_client', (message) => {
			this.receivedMessage(message)
		});
	}
});

// app.getPrevousMessages();
