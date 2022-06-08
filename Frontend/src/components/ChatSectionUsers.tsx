import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import axios from 'axios';
import UserList from './UserList';
import SearchBarAddGroup from './SearchBarAddGroup'
import { isConstructorDeclaration } from 'typescript';
import { chatStateFormat } from '../App'

interface PropsSectionUsers {
	socket : any;
	idMe : number;
	//users : PropsStateUsers[];
	//setUsers : Dispatch<SetStateAction<PropsStateUsers[]>>;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	isFriendshipButtonClicked : boolean;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
	/*chatChannelState : boolean;
	setChatChannelState : Dispatch<SetStateAction<boolean>>;*/
}

export interface  PropsStateUsers {
	id : number;
	username : string;
	pseudo : string;
	avatarId : string;
	status : number;
}

export interface FriendsFormat {
	friendshipId : number;
	id : number;
	username : string;
	pseudo : string;
	avatarId : string;
	status : number;
}

export interface PropsStateChannel {
	id : number;
	isProtected : boolean;
	name : string;
	description : string;
}

const ChatSectionUsers : React.FC<PropsSectionUsers> = (props) => {
	const [ searchUsers, setSearchUsers ] = useState<PropsStateUsers[]>([])
	const [ friends, setFriends ] = useState<FriendsFormat[]>([])
	const [ joinedChannels, setJoinedChannels ] = useState<PropsStateChannel[]>([])
	const [ joiningChannel, setJoiningChannel ] = useState(false)
	const [ existingChannels, setExistingChannels ] = useState<PropsStateChannel[]>([])
	const [ friendRequestsSent, setFriendRequestsSent ] = useState<number[]>([])
	const [ friendRequestReceived, setFriendRequestReceived ] = useState<FriendsFormat[]>([])
	const [ searchValue, setSearchValue ] = useState("")
	const [ createChannelButtonState, setCreateChannelButtonState ] = useState(false)

	useEffect(() => {
		if (searchValue !== "")
		{
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users?search=${searchValue}`, {withCredentials: true})
				.then ((response) => setSearchUsers(response.data))
				.catch((error) => console.log(error))
		}
	}, [searchValue])

	useEffect(() => {
		axios
			.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me/channels`, {withCredentials: true})
			.then((response) => setJoinedChannels(response.data))
			.catch((error) => console.log(error))
	}, [joiningChannel])

	useEffect(() => {
		axios
			.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels?search=${searchValue}` , { withCredentials: true })
			.then (res => {
				let channel = res.data;
				setExistingChannels(channel)
			})
			.catch (err =>
				console.log(err)
			)
	}, [])	

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
							setFriends(friends => [...friends, friends_tmp])
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
						/*if (friendship.status === 1) 
							setFriends(friends => [...friends, friends_tmp])*/
						/*else*/ if (friendship.status === 0) {
							if (friendRequestsSent.find((friend) => friend === friendship.following.id) === undefined)
							{
								if (friendRequestReceived.find((friend) => friend === friendship.following.id) == undefined)
									setFriendRequestReceived(friendRequestReceived => [...friendRequestReceived, friends_tmp])
							}
						}
					})
				})
				.catch (err =>
					console.log(err)
				)
			})
	}

	return (
		<div className='chatArea'>
			<SearchBarAddGroup idMe={props.idMe} setSearchValue={setSearchValue} friends={friends} createChannelButtonState={createChannelButtonState} setCreateChannelButtonState={setCreateChannelButtonState}/>
			{
				!createChannelButtonState && 
				<UserList
					socket = {props.socket}
					idMe={props.idMe}
					existingChannels={existingChannels}
					joinedChannels={joinedChannels}
					setJoiningChannel={setJoiningChannel}
					//setJoinedChannels={setJoinedChannels}
					searchUsers={searchUsers}
					friends={friends}
					setFriends={setFriends}
					friendRequestsSent={friendRequestsSent}
					setFriendRequestsSent={setFriendRequestsSent}
					friendRequestReceived={friendRequestReceived}
					setFriendRequestReceived={setFriendRequestReceived}
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					setChatParamsState={props.setChatParamsState}
					chatParamsState={props.chatParamsState}
					isFriendshipButtonClicked={props.isFriendshipButtonClicked}
					setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}
					/*chatChannelState={props.chatChannelState}
					setChatChannelState={props.setChatChannelState}*/
				/>
			}
		</div>
	)
}

export default ChatSectionUsers;