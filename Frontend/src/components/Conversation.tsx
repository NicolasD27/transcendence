import React, { useState, useEffect } from "react";
import axios from "axios";
import { Socket } from "socket.io";
import Message from "./Message";
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

const Conversation: React.FC<Props> = (props) => {
	const [messages, setMessages] = React.useState<messagesFormat[]>([]);
	const [tmptext, setTmpText] = React.useState("");

	useEffect(() => {
		if (props.id > 0) {
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}/messages`, { withCredentials: true })//Mettre l'ID
				.then(res => {
					setMessages(messages => []);
					const prevMessages = res.data;
					if (props.type === "channel")
						prevMessages.forEach((list: any) => { newMessageChannel(list); });
				})
			const messagesTri = [...messages].sort((a, b) => {
				return b.id - a.id;
			});
			setMessages(messagesTri);
		}
	}, []);

	useEffect(() => {
		if (props.socket) {
			props.socket.emit('connect_to_channel', { channelId: props.id.toString() });
			if (props.type === "channel")
				props.socket.on('msg_to_client', (message) => { newMessageChannel(message); });
			console.log("tsss")
		}
	}, [props.socket]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTmpText(tmpText => e.target.value)
	}

	const handleSubmit = () => {
		const message = {
			activeChannelId: props.id,
			content: tmptext,
		}
		if (tmptext !== "" && props.type === "channel")
			props.socket.emit('msg_to_server', message)
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

	return (

		<div className='convArea'>
			<div id='chatTop'>
				<button id='chatCloseButton' />
				<div id="chatUsername">{props.nameChat}</div>
			</div>
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