import React, { useEffect } from "react";
import { SetStateAction } from "react";
import { Dispatch } from "react";
import axios from "axios";
import Message from "./Message";
import ShowOptionAdmin from "./ShowOptionAdmin";
import OptionAdmin from "./OptionAdmin";
import './Conversation.css';
import { chatStateFormat } from "../App";

export enum BannedState {
	redemption = 0,
	muted = 1,
	banned = 2,
}

interface Props {
	idMe: number;
	id: number;
	type: string;
	nameChat: string;
	pseudo: string;
	socket: any;
	setChatState: Dispatch<SetStateAction<chatStateFormat>>;
	setRecupList: Dispatch<SetStateAction<boolean>>;
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
	avatar: string;
}

interface restrictedFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
	avatar: string;
	bannedtype: number;
}

const Conversation: React.FC<Props> = (props) => {
	const [messages, setMessages] = React.useState<messagesFormat[]>([]);
	const [tmptext, setTmpText] = React.useState("");
	const [status, setStatus] = React.useState(false);
	const [muted, setMuted] = React.useState(false);
	const [showConv, setShowConv] = React.useState(true);

	const [adminLevel, setAdminLevel] = React.useState(0);
	const [activePass, setActivePass] = React.useState<boolean>(false);
	const [activePrivate, setActivePrivate] = React.useState<boolean>(false);
	const [users, setUsers] = React.useState<userFormat[]>([]);
	const [moderators, setModerators] = React.useState<userFormat[]>([]);
	const [userRestricted, setUserRestricted] = React.useState<restrictedFormat[]>([]);
	const [usersBlocked, setUsersBlocked] = React.useState<number[]>([]);

	 const newMessageChannel = async (message: any) => {
		let singleMessage: messagesFormat;
		let avatartmp: string;

		if (message.channel.id === props.id) {
			if (message.user.avatarId === null)
				avatartmp = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
			else
				avatartmp = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${message.user.avatarId}`;
			usersBlocked.forEach(user_id => {
				if (message.user.id === user_id) {
					const nbtmp = message.content.length
					message.content = "" + "*".repeat(nbtmp)
				}
			});
			if (props.idMe === message.user.id)
				singleMessage = { id: message.id, message: message.content, name: message.user.pseudo, avatar: avatartmp, own: true };
			else
				singleMessage = { id: message.id, message: message.content, name: message.user.pseudo, avatar: avatartmp, own: false };
			await setMessages(messages => [...messages, singleMessage]);
		}
	}

	const newMessageDirect = async (message: any) => {
		let singleMessage: messagesFormat;
		let avatartmp: string;
		if ((message.sender.username === props.nameChat) || (message.receiver.username === props.nameChat)) {
			if (message.sender.avatarId === null)
				avatartmp = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
			else
				avatartmp = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${message.sender.avatarId}`;
			usersBlocked.forEach(element => {
				if (message.user.id === element) {
					const nbtmp = message.content.length
					message.content = "" + "*".repeat(nbtmp)
				}
			});
			if (props.idMe === message.sender.id)
				singleMessage = { id: message.id, message: message.content, name: message.sender.pseudo, avatar: avatartmp, own: true };
			else
				singleMessage = { id: message.id, message: message.content, name: message.sender.pseudo, avatar: avatartmp, own: false };
			await setMessages(messages => [...messages, singleMessage]);
		}
	}

	useEffect(() => {
		const abortController = new AbortController()

		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/blocked`, { withCredentials: true, signal : abortController.signal })
			.then(res => {
				setUsersBlocked(res.data)
			}).catch(error => {
				if (error.name === 'AbortError')
				{
					throw error
				}
			})
			if (props.type === "channel")
			props.socket.emit('connect_to_channel', { channelId: props.id.toString() });
			return () => { abortController.abort() }
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const abortController = new AbortController()
		//let isMounted = true
		props.setRecupList(false)
		
		setTimeout(() => { }, 500)
		if (props.type === "channel") {
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}`, { withCredentials: true, signal : abortController.signal })
				.then(res => {
					setModerators([])
					setUserRestricted([])
					setAdminLevel(0)
					const infoChannel = res.data;
					if (infoChannel.owner.id === props.idMe)
						setAdminLevel(adminLevel => 1)
					else {
						infoChannel.moderators.forEach(element => {
							if (element.id === props.idMe)
								setAdminLevel(adminLevel => 2)
						});
					}
					setActivePass(infoChannel.isProtected);
					setActivePrivate(infoChannel.isPrivate);
					infoChannel.moderators.forEach((list: any) => {
						let singleModerator: userFormat;
						if (list.id !== props.idMe) {
							if (list.avatarId === null)
								list.avatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
							else
								list.avatar = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${list.avatarId}`;
							singleModerator = { id: list.id, username: list.username, pseudo: list.pseudo, avatardId: list.avatardId, avatar: list.avatar };
							setModerators(moderators => [...moderators, singleModerator]);
						}
					});
					setMuted(false)
					infoChannel.restricted.forEach((list: any) => {
						let singleRestricted: restrictedFormat;

						if (list.id !== props.idMe) {
							if (list.avatarId === null)
								list.avatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
							else
								list.avatar = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${list.avatarId}`;
							singleRestricted = { id: list.id, username: list.username, pseudo: list.pseudo, avatardId: list.avatardId, avatar: list.avatar, bannedtype: list.bannedState.type };
							setUserRestricted(userRestricted => [...userRestricted, singleRestricted]);
						}
						else {
							if (list.bannedState.type === BannedState.muted) {
								//console.log("muted +++")
								setMuted(true);
							}
						}
					});
				})
				.catch(error => {
					if (error.name === 'AbortError')
					{
						throw error
					}
				})
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}/users`, { withCredentials: true })
				.then(res => {
					const tmpusers = res.data;
					setUsers(users => [])
					tmpusers.forEach((list: any) => {
						let singleUser: userFormat;
						if (list.id !== props.idMe) {
							if (list.avatarId === null)
								list.avatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
							else
								list.avatar = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${list.avatarId}`;
							singleUser = { id: list.id, username: list.username, pseudo: list.pseudo, avatardId: list.avatardId, avatar: list.avatar };
							setUsers(users => [...users, singleUser]);
						}
					});
				})
				.catch(error => {
					if (error.name === 'AbortError')
					{
						throw error
					}
				})
		}
		return () => { abortController.abort() }

	}, [props, showConv, status, props.id, props.idMe, props.type]);//Recuperer les infos du channels

	useEffect(() => {
		const abortController = new AbortController()
		if (props.id > 0 && props.type) {
			//console.log("retrieving msgs")
			let recupMessage = "";
			if (props.type === "channel")
				recupMessage = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}/messages`
			else if (props.type === "directMessage")
				recupMessage = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/direct_messages/${props.id}`
			axios.get(recupMessage, { withCredentials: true })
				.then(res => {
					setMessages([])
					const prevMessages = res.data
					const messagesTri = [...prevMessages].sort((a, b) => {
						return a.id - b.id;
					});
					if (props.type === "channel") {
						messagesTri.forEach((list: any) => { newMessageChannel(list); });
						if (muted)
							newMessageChannel({ id: 0, channel: { id: props.id }, user: { id: 0, avatarId: null }, content: "You are muted !", name: "moderator", avatar: null, own: false })
					}
					else if (props.type === "directMessage")
						messagesTri.forEach((list: any) => { newMessageDirect(list); });
					const msgDiv = document.querySelector(".messages")
					msgDiv?.scroll(0, msgDiv.scrollHeight)
				})
				.catch((err) => {
						if (err.name === 'AbortError')
						{
							setMessages(messages => []);
							newMessageChannel({ id: 0, channel: { id: props.id }, user: { id: 0, avatarId: null }, content: "You are banned !", name: "moderator", avatar: null, own: false })
							throw err
						}
					
				})
		}
		return () => { abortController.abort() }
	}, [props.id, showConv, status, muted, props.type, usersBlocked]);// eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const fetchData = async (message) => {
					await setStatus(status => !status)
		  }
		  const fetchDataDirect = async (message) => {
			await newMessageDirect(message)
		  }
		let isMounted = true
		if (props.socket && isMounted) {
			if (props.type === "channel") {
				props.socket.on('msg_to_client', (message) => {
					if (isMounted)
					{
						fetchData(message)
					}
				});
				props.socket.on('error_msg', () => { setStatus(status => !status) })
			}
			else if (props.type === "directMessage") {
				props.socket.on('direct_msg_to_client', (message) => {
					if (isMounted)
					{
						fetchDataDirect(message)
					}
				});
			}
		}
		return () => { isMounted = false }
	}, [props.socket]);// eslint-disable-line react-hooks/exhaustive-deps

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTmpText(tmpText => e.target.value)
	}

	const handleSubmit = () => {
		const messageChannel = {
			activeChannelId: props.id,
			content: tmptext,
		}
		const messageDirect = {
			receiver: props.nameChat,
			content: tmptext,
		}
		if (tmptext !== "" && props.type === "channel")
			props.socket.emit('msg_to_server', messageChannel)
		else if (tmptext !== "" && props.type === "directMessage") {
			props.socket.emit('direct_msg_to_server', messageDirect)
		}
		setTmpText("");
	}

	const handleKeyPress = (event: any) => {
		if (event.key === 'Enter') {
			handleSubmit()
		}
	}



	return (
		<div className='convArea'>
			<div id='chatTop'>
				<button id='chatCloseButton' onClick={() => props.setChatState({ 'chatState': false, id: 0, chatName: "", chatPseudo: "", type: "directM" })} />
				<div id="chatUsername">{props.pseudo}</div>
				{props.type === "channel" && <ShowOptionAdmin showConv={showConv} setShowConv={setShowConv} />}
			</div>
			{showConv === true && <div className='messages'>
				{messages.map((m, i) => (
					<Message key={m.id} message={m.message} name={m.name} own={m.own} avatar={m.avatar} />
				))}
			</div>}
			{showConv === true && <div className="sendText">
				<div className='writingText'>
					<input type='text' name='typemessage' onChange={handleChange} value={tmptext} onKeyDown={handleKeyPress} />
				</div>
				<button className="sendIcon" onClick={handleSubmit} />
			</div>}
			{props.type === "channel" && showConv === false && <OptionAdmin idMe={props.idMe} nameChat={props.nameChat} adminLevel={adminLevel} socket={props.socket} id={props.id} activePass={activePass} activePrivate={activePrivate} users={users} moderators={moderators} userRestricted={userRestricted} setShowConv={setShowConv} setChatState={props.setChatState} setRecupList={props.setRecupList} />}
		</div>
	);
};

export default Conversation;