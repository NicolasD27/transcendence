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
	const [ friendRequestReceived, setFriendRequestReceived ] = useState<FriendsFormat[]>([])

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
							let friendRequestReceived_tmp = friendRequestReceived.filter((request) => request.id !== friends_tmp.id)
							setFriendRequestReceived(friendRequestReceived_tmp)
						}
					})
			})
			props.setIsFriendshipButtonClicked(false)
		}
	}, [props.idMe, props.isFriendshipButtonClicked])

	if (props.idMe)
	{
			props.socket.on("notifyFriendRequest", data => { 
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.idMe}`, { withCredentials: true })
				.then (res => {
					let users = res.data;
					setFriendRequestReceived([])
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
							setFriendRequestReceived(friendRequestReceived => [...friendRequestReceived, friends_tmp])
						}
					})
				})
			})
	}

	return (
		<>
			{!props.chatParamsState.chatState && <ChatSectionUsers socket={props.socket} idMe={idMe} setChatParamsState={setChatParamsState} chatParamsState={chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} friends={friends} friendRequestsSent={friendRequestsSent} setFriendRequestsSent={setFriendRequestsSent} friendRequestReceived={friendRequestReceived} setFriendRequestReceived={setFriendRequestReceived}/>}
			{ chatParamsState.chatState && <Conversation idMe={idMe} id={chatParamsState.id} type={chatParamsState.type} nameChat={chatParamsState.chatName} socket={props.socket} setChatState={setChatParamsState}/>}
		</>
	)
}

export default Chat;