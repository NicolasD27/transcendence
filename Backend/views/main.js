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
		directMessageContent: '',
		receiver: "R5hXuq2f",
		directMessages: [],
		match: {},
		channelId: '',
		banId: '',
		banTimeOut: 60,
		idToInvite: 2,
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
		match: [],
		channelId: 1,
		status: 1
	},
	methods: {
		connectToChannel() {
			this.socket.emit('connect_to_channel', { channelId: this.channelId });
		},
		sendMessage() {
			if(this.validateInput()) {
				const message = {
					activeChannelId: this.channelId,
					content: this.content,
					author: this.author
				}
				this.socket.emit('msg_to_server', message)
				// console.log(message);
			}
			this.content = '';
		},
		receivedMessage(message) {
			// console.log(message);
			this.messages.push(message);
		},
		validateInput() {
			// return this.author.length > 0 && this.content.length > 0;	// need to be done server side too
			return true;
		},
		async getPreviousMessages() {
			let msgs = await (await fetch(`http://localhost:8000/api/channels/${this.channelId}/messages`)).json();
			this.messages = [];
			for (let i = msgs.length - 1; i >= 0; --i) {
				this.receivedMessage(msgs[i]);
			}
		},
		async sendInvite() {
			this.socket.emit('sendInvite', { channelId: this.channelId, userId: this.idToInvite});
		},
		// closeChannel() {
		// 	this.socket.emit('leave', { channelId: this.channelId });
		// },
		banUser() {
			this.socket.emit('ban', { userId: this.banId, timeout: this.banTimeOut, channelId: this.channelId });
		},
		muteUser() {
			this.socket.emit('mute', { userId: this.banId, timeout: this.banTimeOut, channelId: this.channelId });
		},
		unBanUser() {
			this.socket.emit('rescue', { userId: this.banId, channelId: this.channelId });
		},
		moderationMessage(data, i) {
			// ? it could be cool to pass every messages from this user to spoilers.
			// ? I will have to add a timer in the backend to tell every connected clients when the ban is finished

			console.log(data);
			let message_content;
			if (i === 1)
				message_content = `${data.user_id} has been banned`;
			else if (i === 2)
				message_content = `${data.user_id} has been muted`;
			else if (i === 3)
				message_content = `${data.user_id} has been rescued`;
			else
			{
				console.log("error: moderationMessage() needs a number between 1 and 3 in second argument.");
				return ;
			}
			const m = {
				activeChannelId: data.channel_id,
				content: message_content,
				user: {	username: "Moderation" }
			}
			this.receivedMessage(m);
		},
		newChannelInviteReceived(data) {
			console.log("newChannelInviteReceived");
			console.log(data);
		},
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
			// console.log(this.match);
		},
		updateApp() {
			this.connectToChannel();
			this.getPreviousMessages();
		},
		sendStatusUpdate() {
			console.log("sending status Update")
			this.socket.emit('sendStatusUpdate', {newStatus: this.status});
		},
		sendDirectMessage() {
			console.log(this.directMessageContent);
			if(this.validateInput()) {
				const message = {
					receiver: this.receiver,
					content: this.directMessageContent,
					author: this.author
				}
				this.socket.emit('direct_msg_to_server', message)
			}
			this.directMessageContent = '';
		},
		receivedDirectMessage(message) {
			this.directMessages.push(message);
		},
	},
	created() {
		// console.log("here", document.cookie.split('=')[1])
		this.socket = io.connect('http://localhost:8000', this.socketOptions);
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
		this.socket.on('direct_msg_to_client', (message) => {
			this.receivedDirectMessage(message);
		});

		this.socket.on('ban', (data) => {
			this.moderationMessage(data, 1);
		});
		this.socket.on('mute', (data) => {
			this.moderationMessage(data, 2);
		});
		this.socket.on('rescue', (data) => {
			this.moderationMessage(data, 3);
		});
		this.socket.on('new_channel_invite_received',(data)=>{
			this.newChannelInviteReceived(data);
		});
	}
});

app.connectToChannel();
app.getPreviousMessages();

