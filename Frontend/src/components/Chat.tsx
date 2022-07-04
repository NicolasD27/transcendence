import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import ChatSectionUsers from './ChatSectionUsers';
import Conversation from './Conversation';
import { chatStateFormat } from '../App';
import { FriendsFormat } from '../App';

export enum FriendshipStatus {
    PENDING,
    ACTIVE,
    BLOCKED_BY_FOLLOWER,
    BLOCKED_BY_FOLLOWING
}

export interface PropsChat {
	idMe: number;
	socket: any;
	friends : FriendsFormat[];
	setFriends : Dispatch<SetStateAction<FriendsFormat[]>>;
	chatParamsState: chatStateFormat;
	setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>;
	isFriendshipButtonClicked: boolean;
	setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>;
	friendRequests : number[];
	setFriendRequests : Dispatch<SetStateAction<number[]>>;
	blockedByUsers : number[];
}

const Chat: React.FC<PropsChat> = (props) => {
	const [chatParamsState, setChatParamsState] = useState<chatStateFormat>({ 'chatState': false, id: 0, chatName: "", chatPseudo: "", type: "directMessage" })
	const { idMe, setIsFriendshipButtonClicked } = props;
	const [recupList, setRecupList] = useState(false)
	const [usersBlocked, setUsersBlocked] = useState<number[]>([])

	//console.log("Chat.tsx")

	 useEffect(() => {
		axios
			.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/blocked`, { withCredentials: true })
			.then(res => setUsersBlocked(res.data))	
			.catch(error => {})
	}, [])
	
	props.socket.on('friendship_state_updated', () => {
		axios
		.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/blocked`, { withCredentials: true })
		.then(res => setUsersBlocked(res.data))
		.catch(error => {})
	})

	useEffect(() => {
		props.socket.on('refreshFriendList', () => {
			setIsFriendshipButtonClicked(true)
		});
		if (props.idMe && props.isFriendshipButtonClicked === true)
		{
			setTimeout(()=> {
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${idMe}`, { withCredentials: true })
				.then(res => {
					let users = res.data;
					props.setFriends([])
					//console.log("JE passe ici")
					users.forEach((friendship: any) => {
						let friends_tmp: FriendsFormat;
						let userId : number;
						if (friendship.following.id === props.idMe) {
							userId = friendship.follower.id
							friends_tmp = {
								friendshipId: friendship.id,
								friendshipStatus: friendship.status,
								id: userId,
								username: friendship.follower.username,
								pseudo: friendship.follower.pseudo,
								avatarId: friendship.follower.avatarId,
								status: friendship.follower.status,
							}
						}
						else {
							userId = friendship.following.id
							friends_tmp = {
								friendshipId: friendship.id,
								friendshipStatus: friendship.status,
								id: userId,
								username: friendship.following.username,
								pseudo: friendship.following.pseudo,
								avatarId: friendship.following.avatarId,
								status: friendship.following.status,
							}
						}
						if (friendship.status === FriendshipStatus.ACTIVE) {
							props.setFriends(friends => [...friends, friends_tmp])
							let friendRequests_tmp = props.friendRequests.filter((requestId) => requestId !== friends_tmp.id)
							props.setFriendRequests(friendRequests_tmp)
						}
						else if (friendship.status === FriendshipStatus.BLOCKED_BY_FOLLOWER || friendship.status === FriendshipStatus.BLOCKED_BY_FOLLOWING) {
							props.setFriends(friends => [...friends, friends_tmp])
						}
						else
							props.setFriendRequests(friendRequests => [...friendRequests, userId])
		
					})
			})
			.catch(error => {})
			setIsFriendshipButtonClicked(false)}, 1000)
		}
	}, [props, props.idMe, props.isFriendshipButtonClicked, props.friendRequests, idMe, setIsFriendshipButtonClicked, props.socket])

	if (props.idMe && props.socket)
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
									friendshipStatus: friendship.status,
									id : friendship.follower.id ,
									username : friendship.follower.username ,
									pseudo : friendship.follower.pseudo ,
									avatarId : friendship.follower.avatarId ,
									status : friendship.follower.status,
								}
							}
							else {
								friends_tmp = {
									friendshipId : friendship.id,
									friendshipStatus: friendship.status,
									id : friendship.following.id ,
									username : friendship.following.username ,
									pseudo : friendship.following.pseudo ,
									avatarId : friendship.following.avatarId ,
									status : friendship.following.status,
								}
							}
							if (friendship.status === 1) {
								props.setFriends(friends => [...friends, friends_tmp])
								let friendRequests_tmp = props.friendRequests.filter((requestId) => requestId !== friends_tmp.id)
								props.setFriendRequests(friendRequests_tmp)
							}
					})
				})
				.catch(error => {})
			})

			props.socket.on('notifyFriendRequest', data => {
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.idMe}`, { withCredentials: true })
				.then(res => {
					let users = res.data;
					props.setFriendRequests([])
					users.forEach((friendship: any) => {
						let userId : number;
						if (friendship.status === FriendshipStatus.PENDING)
						{
							if (friendship.following.id === props.idMe)
									userId = friendship.follower.id;
							else
								userId = friendship.following.id;
							props.setFriendRequests(friendRequests => [...friendRequests, userId])
						}
					})
				})
				.catch(error => {})
			})
	}

	const handleResize = () => {
		const gameArea = document.getElementById("gameArea")
		const chatArea = document.querySelector(".chatArea")
		const  width = document.body.clientWidth
		if (chatArea && gameArea && width > 1155) {
			chatArea.setAttribute("style", `height:${gameArea.offsetHeight}px`);
		}
	}

	useEffect(() => {
		handleResize()
		window.addEventListener('resize', handleResize)
	})

	return (
		<>
			{!chatParamsState.chatState && <ChatSectionUsers socket={props.socket} idMe={idMe} setChatParamsState={setChatParamsState} chatParamsState={chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} friends={props.friends} friendRequests={props.friendRequests} setFriendRequests={props.setFriendRequests} blockedByUsers={props.blockedByUsers} usersBlocked={usersBlocked} setUsersBlocked={setUsersBlocked} recupList={recupList}/>}
			{chatParamsState.chatState && <Conversation idMe={idMe} id={chatParamsState.id} type={chatParamsState.type} nameChat={chatParamsState.chatName} pseudo={chatParamsState.chatPseudo} socket={props.socket} setChatState={setChatParamsState} setRecupList={setRecupList} />}
		</>
	)
}

export default Chat;