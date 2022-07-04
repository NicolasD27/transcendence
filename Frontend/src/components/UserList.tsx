import React, { useState, useEffect,  Dispatch ,SetStateAction} from 'react';
import axios from 'axios';
import statusIconBlue from "../asset/statusIconBlue.svg"
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import PrintChannels from './PrintChannels';
import { PropsStateChannel } from './ChatSectionUsers'
import { FriendsFormat } from '../App'
import { PropsStateUsers } from './ChatSectionUsers'
import { chatStateFormat } from '../App'
import { PropsMatchs } from './ChatSectionUsers';
import PrintFriend from './PrintFriend';
import './UserList.css'

interface  PropsUserList {
	socket : any;
	idMe : number;
	existingChannels: PropsStateChannel[];
	joinedChannels : PropsStateChannel[]
	setJoiningChannel: Dispatch<SetStateAction<boolean>>;
	searchUsers : PropsStateUsers[];
	friends: FriendsFormat[];
	friendRequests : number[];
	setFriendRequests : Dispatch<SetStateAction<number[]>>;
	searchValue: string;
	setSearchValue : Dispatch<SetStateAction<string>>;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
	matchs : PropsMatchs[];
	goToMatch : Function;
	blockedByUsers : number[];
	usersBlocked : number[];
	setUsersBlocked: Dispatch<SetStateAction<number[]>>;
}

const UserList : React.FC<PropsUserList> = (props) => {
	const existingChannels = props.existingChannels;
	const setJoiningChannel = props.setJoiningChannel;
	const friends = props.friends;
	const searchValue = props.searchValue;
	const searchUsers = props.searchUsers;
	const friendRequests = props.friendRequests;
	const [ ImPlaying, setImPlaying ] = useState(false)

	
	useEffect(() => {
		axios
			.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, {withCredentials: true})
			.then((response) => response.data.status === 3 && setImPlaying(true))
			.catch((error) => console.log(error))
	}, [])

	const isAlreadyFriend = (id:number) => {
		for(let i = 0; i < friends.length; i++ )
		{
			if (friends[i].id === id)
				return true
		}
		return false
	}

	const isAlreadyMember = (channelId:number) => {
		for (let i = 0; i < props.joinedChannels.length; i++)
		{
			if (props.joinedChannels[i].id === channelId)
				return true;
		}
		return false;
	}

	const sendFriendshipRequest = (user:PropsStateUsers) => {
		if (props.socket)
		{
			props.socket.emit('sendFriendRequest', {user_id: user.id})
			props.setFriendRequests(friendRequests => [...friendRequests, user.id])
		}
	}

	const catchFriendshipId = (id:number) => {
		for(let i = 0; i < friends.length; i++ )
		{
			if (friends[i].id === id)
				return friends[i].friendshipId
		}
	}

	const isThereAFriendshipRequest = (id:number) => {
		for (let i = 0; i < friendRequests.length; i++)
		{
			if (friendRequests[i] === id)
				return true
		}
		return false;
	}

	const catchUserMatch = () => {
		for (let i = 0; i < props.matchs.length; i++)
		{
			if (props.matchs[i].user1Id !== props.idMe && props.matchs[i].user2Id !== props.idMe)
				return (props.matchs[i].idMatch)
		}
		return -1;
	}

	const checkIfBlockedByFriend = (id:number) => {
		for (let i = 0; i < props.blockedByUsers.length; i++)
		{
			if (props.blockedByUsers[i] === id)
				return true
		}
		return false;
	}


	const checkIfUserIsBLocked = (id:number) => {
		for (let i = 0; i < props.usersBlocked.length; i++)
		{
			if (props.usersBlocked[i] === id)
				return true
		}
		return false;
	}

	var isFriend = false;
	var pendingRequest = false;
	return (
			<div className='usersList'>
				{
					searchValue !== ""
					&& existingChannels
						.filter((channel) => {
							if (channel)
								return channel.name.toLowerCase().includes(searchValue.toLowerCase())
							return false
						})
						.map((channel:any) => {
							const isMember = isAlreadyMember(channel.id);
							return <PrintChannels channel={channel} setJoiningChannel={setJoiningChannel} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} isMember={isMember} key={channel.id}/>
						})
				}
				{
					searchValue !== ""
					&& searchUsers
						.filter((user_) => {
							if (user_.id !== props.idMe)
								return user_.pseudo.toLowerCase().includes(searchValue.toLowerCase())
							return false
						})
						.map((user_) => {
							
							let statusIcon = "";
							if (user_.status === 1)
								statusIcon = statusIconGreen
							else if (user_.status === 0)
								statusIcon = statusIconRed
							else
								statusIcon = statusIconBlue
							let friendshipId = Number(catchFriendshipId(user_.id));
							let matchId = catchUserMatch()
							let blockedByFriend = checkIfBlockedByFriend(user_.id)
							let isUserBlocked = checkIfUserIsBLocked(user_.id)
							if (Boolean(isAlreadyFriend(user_.id)) === true)
								isFriend = true;
							else if (Boolean(isThereAFriendshipRequest(user_.id)) === true)
								pendingRequest = true;
							
							return <PrintFriend idMe={props.idMe} socket={props.socket} ImPlaying={ImPlaying} user={user_} friendshipId={friendshipId} friendshipStatus={0} statusIcon={statusIcon} isFriend={isFriend} pendingRequest={pendingRequest} sendFriendshipRequest={sendFriendshipRequest} blockedByFriend={blockedByFriend} isUserBlocked={isUserBlocked} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} matchId={matchId} goToMatch={props.goToMatch} setUsersBlocked={props.setUsersBlocked} key={user_.id} />
						})
				}
				{
					!searchValue &&
						props.joinedChannels
							.map((channel) => {
								return <PrintChannels channel={channel} setJoiningChannel={setJoiningChannel} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} isMember={true} key={channel.id}/>
							})
				}
				{
						!searchValue &&
						friends
							.filter(friend => {
								if (friend.id !== props.idMe)
									return friend;
								return false
							})
							.map((friend) => {
								let statusIcon = ""
								//console.log(`${friend.pseudo} = ${friend.status}`)
								if (friend.status === 1)
									statusIcon = statusIconGreen
								else if (friend.status === 0)
									statusIcon = statusIconRed
								else
									statusIcon = statusIconBlue
								let matchId = catchUserMatch()
								let blockedByFriend = checkIfBlockedByFriend(friend.id)
								let isUserBlocked = checkIfUserIsBLocked(friend.id)
								return <PrintFriend idMe={props.idMe} socket={props.socket} ImPlaying={ImPlaying} user={friend} friendshipId={friend.friendshipId} friendshipStatus={friend.friendshipStatus} statusIcon={statusIcon} isFriend={true} pendingRequest={false} sendFriendshipRequest={sendFriendshipRequest} blockedByFriend={blockedByFriend} isUserBlocked={isUserBlocked} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} matchId={matchId} goToMatch={props.goToMatch} setUsersBlocked={props.setUsersBlocked} key={friend.id} />
							})
				}
			</div>
	)
}

export default UserList;