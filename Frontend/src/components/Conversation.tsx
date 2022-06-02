import React, { useState, useEffect } from "react";
import axios from "axios";
import { Socket } from "socket.io";
import Message from "./Message";
import EditChannel from "./EditChannel";
import './Conversation.css';

import statusIconGreen from "../asset/statutIconGreen.svg"
import user1 from "../asset/friend1.svg"

interface Props {
	idMe: number;
	id: number;
	type: string;
	nameChat: string;
	socket: any;
}

interface messagesFormat {
	id: number;
	message: string;
	name: string;
	avatar: string;
	own: boolean;
}

interface userFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
	status: number;
	isTwoFactorEnable: boolean;
}

const Conversation: React.FC<Props> = (props) => {
	const [messages, setMessages] = React.useState<messagesFormat[]>([]);
	const [tmptext, setTmpText] = React.useState("");
	const [userPerso, setUserPerso] = React.useState<userFormat>();
	const [userFriend, setUserFriend] = React.useState<userFormat>();

	useEffect(() => {
		if (props.type === "directMessage") {
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.id}`, { withCredentials: true })
				.then(res => {
					const friendships = res.data;
					friendships.forEach(friendship => {
						if (friendship.id === props.id) {
							if (friendship.follower.id == props.idMe) {
								setUserPerso(userPerso => friendship.follower)
								setUserFriend(userFriend => friendship.following)
							}
							else {
								setUserPerso(userPerso => friendship.following)
								setUserFriend(userFriend => friendship.follower)
							}
						}
					})
				})
		}
	}, []);

	useEffect(() => {
		if (props.id > 0) {
			let recupMessage = "";
			if (props.type === "channel")
				recupMessage = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}/messages`
			else if (props.type === "directMessage")
				recupMessage = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/direct_messages/${props.id}`
			axios.get(recupMessage, { withCredentials: true })
				.then(res => {
					setMessages(messages => []);
					const prevMessages = res.data;
					if (props.type === "channel")
						prevMessages.forEach((list: any) => { newMessageChannel(list); });
					else if (props.type === "directMessage")
						prevMessages.forEach((list: any) => { newMessageDirect(list); });
				})
			const messagesTri = [...messages].sort((a, b) => {
				return b.id - a.id;
			});
			setMessages(messagesTri);
		}
	}, [props.id]);

	useEffect(() => {
		if (props.socket) {
			if (props.type === "channel") {
				props.socket.emit('connect_to_channel', { channelId: props.id.toString() });
				props.socket.on('msg_to_client', (message) => { newMessageChannel(message); });
			}
			else if (props.type === "directMessage") {
				console.log("Hola")
				props.socket.on('direct_msg_to_client', (message) => {
					newMessageDirect(message);
				});
			}
		}
		console.log("Type: " + props.type)
	}, [props.socket]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTmpText(tmpText => e.target.value)
	}

	const handleSubmit = () => {
		const messageChannel = {
			activeChannelId: props.id,
			content: tmptext,
		}
		const messageDirect = {
			receiver: userFriend?.username,
			content: tmptext,
		}
		if (tmptext !== "" && props.type === "channel")
			props.socket.emit('msg_to_server', messageChannel)
		else if (tmptext !== "" && props.type === "directMessage") {
			props.socket.emit('direct_msg_to_server', messageDirect)
		}
		setTmpText("");
	}

	const newMessageChannel = (message: any) => {
		let singleMessage: messagesFormat;
		let avatartmp: string;

		if (message.channel.id === props.id) {
			if (message.user.avatarId === null)
				avatartmp = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
			else
				avatartmp = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${message.user.avatarId}`;
			if (props.idMe === message.user.id)
				singleMessage = { id: message.id, message: message.content, name: message.user.pseudo, avatar: avatartmp, own: true };
			else
				singleMessage = { id: message.id, message: message.content, name: message.user.pseudo, avatar: avatartmp, own: false };
			setMessages(messages => [...messages, singleMessage]);
		}
	}

	const newMessageDirect = (message: any) => {
		let singleMessage: messagesFormat;
		let avatartmp: string;
		if ((message.sender.username === props.nameChat) || (message.receiver.username === props.nameChat)) {
			if (message.sender.avatarId === null)
				avatartmp = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
			else
				avatartmp = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${message.sender.avatarId}`;
			if (props.idMe === message.sender.id)
				singleMessage = { id: message.id, message: message.content, name: message.sender.pseudo, avatar: avatartmp, own: true };
			else
				singleMessage = { id: message.id, message: message.content, name: message.sender.pseudo, avatar: avatartmp, own: false };
			setMessages(messages => [...messages, singleMessage]);
		}
	}

	return (

		<div className='convArea'>
			<div id='chatTop'>
				<button id='chatCloseButton' />
				<div id="chatUsername">{props.nameChat}</div>
			</div>
			<EditChannel id={props.id} />
			<div className='messages'>
				{messages.map((m, i) => (
					<Message key={i} message={m.message} name={m.name} own={m.own} avatar={m.avatar} />
				))}
			</div>
			<div className="sendText">
				<div className='writingText'>
					<input type='text' name='typemessage' onChange={handleChange} value={tmptext} />
				</div>
				<button className="sendIcon" onClick={handleSubmit} />
			</div>
		</div>
	);
};

export default Conversation;