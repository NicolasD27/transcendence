import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';
import axios from 'axios';
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import user1 from "../asset/friend1.svg"
import ChatSectionUsers from './ChatSectionUsers';
import Conversation from './Conversation';
import { chatStateFormat } from '../App';

export interface PropsChat {
	idMe : number;
	socket : any;
	chatParamsState : chatStateFormat;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	isFriendshipButtonClicked : boolean;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
}

export interface FriendsFormat {
	friendshipId : number;
	id : number;
	username : string;
	pseudo : string;
	avatarId : string;
	status : number;
}

const Chat : React.FC<PropsChat> = (props) => {
	const [ chatParamsState, setChatParamsState ] = useState<chatStateFormat>({'chatState' : false, id : 0, chatName : "" , type : "directMessage" })
	const [ friends, setFriends ] = useState<FriendsFormat[]>([])
	const [ friendRequestsSent, setFriendRequestsSent ] = useState<number[]>([])
	const [ friendRequestsReceived, setFriendRequestsReceived ] = useState<FriendsFormat[]>([])

	const idMe = props.idMe;

	useEffect(() => {
		if (props.idMe && props.isFriendshipButtonClicked === true)
		{
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.idMe}`, { withCredentials: true })
				.then (res => {
					let users = res.data;
					setFriends([])
					users.map((friendship:any) => {
						let friends_tmp : FriendsFormat;
						if (friendship.following.id === props.idMe)
						{
							friends_tmp = { 
								friendshipId : friendship.id,
								id : friendship.follower.id ,
								username : friendship.follower.username ,
								pseudo : friendship.follower.pseudo ,
								avatarId : friendship.follower.avatarId ,
								status : friendship.follower.status
							}
						}
						else {
							friends_tmp = { 
								friendshipId : friendship.id,
								id : friendship.following.id ,
								username : friendship.following.username ,
								pseudo : friendship.following.pseudo ,
								avatarId : friendship.following.avatarId ,
								status : friendship.following.status
							}
						}
						if (friendship.status === 1)
						{
							setFriends(friends => [...friends, friends_tmp])
							let friendRequestsReceived_tmp = friendRequestsReceived.filter((request) => request.id !== friends_tmp.id)
							setFriendRequestsReceived(friendRequestsReceived_tmp)
						}
					})
			})
			props.setIsFriendshipButtonClicked(false)
		}
	}, [props.idMe, props.isFriendshipButtonClicked])

	if (props.idMe)
	{
			props.socket.on('notifyFriendRequest', data => { 
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.idMe}`, { withCredentials: true })
				.then (res => {
					let users = res.data;
					setFriendRequestsReceived([])
					users.map((friendship:any) => {
						let friends_tmp : FriendsFormat;
						friends_tmp = { 
							friendshipId : friendship.id,
							id : friendship.follower.id ,
							username : friendship.follower.username ,
							pseudo : friendship.follower.pseudo ,
							avatarId : friendship.follower.avatarId ,
							status : friendship.follower.status
						}
						if (friendship.status === 0) {
							setFriendRequestsReceived(friendRequestsReceived => [...friendRequestsReceived, friends_tmp])
						}
					})
				})
			})
	}

	const handleResize = () => {
		
		const gameArea = document.getElementById("gameArea")
		const chatArea = document.querySelector(".chatArea")
		if (chatArea && gameArea)
		{
			console.log("hello")
			chatArea.setAttribute("style",`height:${gameArea.offsetHeight}px`);
		}

	}

	useEffect(() => {
		handleResize()
		window.addEventListener('resize', handleResize)
		
	})
	
		

	return (
		<>
			{!props.chatParamsState.chatState && <ChatSectionUsers socket={props.socket} idMe={idMe} setChatParamsState={setChatParamsState} chatParamsState={chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} friends={friends} friendRequestsSent={friendRequestsSent} setFriendRequestsSent={setFriendRequestsSent} friendRequestsReceived={friendRequestsReceived} setFriendRequestsReceived={setFriendRequestsReceived}/>}
			{ chatParamsState.chatState && <Conversation idMe={idMe} id={chatParamsState.id} type={chatParamsState.type} nameChat={chatParamsState.chatName} socket={props.socket} setChatState={setChatParamsState}/>}
		</>
	)
}

export default Chat;