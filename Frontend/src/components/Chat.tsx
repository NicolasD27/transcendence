import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import ChatSectionUsers from './ChatSectionUsers';
import Conversation from './Conversation';
import { chatStateFormat } from '../App';
import { FriendsFormat } from '../App';

export interface PropsChat {
	idMe: number;
	socket: any;
	friends : FriendsFormat[];
	setFriends : Dispatch<SetStateAction<FriendsFormat[]>>;
	chatParamsState: chatStateFormat;
	setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>;
	isFriendshipButtonClicked: boolean;
	setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>;
	friendRequestsSent : number[];
	setFriendRequestsSent : Dispatch<SetStateAction<number[]>>;
	friendRequestsReceived : FriendsFormat[];
	setFriendRequestsReceived : Dispatch<SetStateAction<FriendsFormat[]>>
}

const Chat: React.FC<PropsChat> = (props) => {
	const [chatParamsState, setChatParamsState] = useState<chatStateFormat>({ 'chatState': false, id: 0, chatName: "", type: "directMessage" })

	const { idMe, setIsFriendshipButtonClicked } = props;

	useEffect(() => {
		if (props.idMe && props.isFriendshipButtonClicked === true)
		{
			setTimeout(()=> {
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${idMe}`, { withCredentials: true })
				.then(res => {
					let users = res.data;
					props.setFriends([])
					users.forEach((friendship: any) => {
						let friends_tmp: FriendsFormat;
						if (friendship.following.id === props.idMe) {
							friends_tmp = {
								friendshipId: friendship.id,
								id: friendship.follower.id,
								username: friendship.follower.username,
								pseudo: friendship.follower.pseudo,
								avatarId: friendship.follower.avatarId,
								status: friendship.follower.status
							}
						}
						else {
							friends_tmp = {
								friendshipId: friendship.id,
								id: friendship.following.id,
								username: friendship.following.username,
								pseudo: friendship.following.pseudo,
								avatarId: friendship.following.avatarId,
								status: friendship.following.status
							}
						}
						if (friendship.status === 1) {
							props.setFriends(friends => [...friends, friends_tmp])
							let friendRequestsReceived_tmp = props.friendRequestsReceived.filter((request) => request.id !== friends_tmp.id)
							props.setFriendRequestsReceived(friendRequestsReceived_tmp)
						}
					})
			})
			setIsFriendshipButtonClicked(false)}, 1000)
		}
	}, [props.idMe, props.isFriendshipButtonClicked, props.friendRequestsReceived, idMe, setIsFriendshipButtonClicked])

	if (props.idMe)
	{
			props.socket.on('notifyFriendRequestAccepted', data => {
				axios
					.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${idMe}`, { withCredentials: true })
					.then (res => {
						let users = res.data;
						props.setFriends([])
						users.forEach((friendship:any) => {
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
							if (friendship.status === 1) {
								props.setFriends(friends => [...friends, friends_tmp])
								let friendRequestsSent_tmp = props.friendRequestsSent.filter((requestId) => requestId !== friends_tmp.id)
								props.setFriendRequestsSent(friendRequestsSent_tmp)
							}
					})
				})
			})

			props.socket.on('notifyFriendRequest', data => { 
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.idMe}`, { withCredentials: true })
				.then(res => {
					let users = res.data;
					props.setFriendRequestsReceived([])
					users.forEach((friendship: any) => {
						let friends_tmp: FriendsFormat;
						friends_tmp = {
							friendshipId: friendship.id,
							id: friendship.follower.id,
							username: friendship.follower.username,
							pseudo: friendship.follower.pseudo,
							avatarId: friendship.follower.avatarId,
							status: friendship.follower.status
						}
						if (friendship.status === 0) {
							props.setFriendRequestsReceived(friendRequestsReceived => [...friendRequestsReceived, friends_tmp])
						}
					})
				})
			})
	}

	const handleResize = () => {
		const gameArea = document.getElementById("gameArea")
		const chatArea = document.querySelector(".chatArea")
		if (chatArea && gameArea) {
			chatArea.setAttribute("style", `height:${gameArea.offsetHeight}px`);
		}
	}

	useEffect(() => {
		handleResize()
		window.addEventListener('resize', handleResize)

	})

	return (
		<>
			{!chatParamsState.chatState && <ChatSectionUsers socket={props.socket} idMe={idMe} setChatParamsState={setChatParamsState} chatParamsState={chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} friends={props.friends} friendRequestsSent={props.friendRequestsSent} setFriendRequestsSent={props.setFriendRequestsSent} friendRequestsReceived={props.friendRequestsReceived} setFriendRequestsReceived={props.setFriendRequestsReceived} />}
			{chatParamsState.chatState && <Conversation idMe={idMe} id={chatParamsState.id} type={chatParamsState.type} nameChat={chatParamsState.chatName} socket={props.socket} setChatState={setChatParamsState} />}
		</>
	)
}

export default Chat;