import React, { Dispatch, SetStateAction} from 'react';
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import PrintChannels from './PrintChannels';
import { PropsStateChannel } from './ChatSectionUsers'
import { FriendsFormat } from '../App'
import { PropsStateUsers } from './ChatSectionUsers'
import { chatStateFormat } from '../App'
import PrintFriend from './PrintFriend';

interface  PropsUserList {
	socket : any;
	idMe : number;
	existingChannels: PropsStateChannel[];
	joinedChannels : PropsStateChannel[]
	setJoiningChannel: Dispatch<SetStateAction<boolean>>;
	searchUsers : PropsStateUsers[];
	friends: FriendsFormat[];
	friendRequestsSent : number[];
	setFriendRequestsSent : Dispatch<SetStateAction<number[]>>;
	friendRequestsReceived : FriendsFormat[];
	setFriendRequestsReceived :  Dispatch<SetStateAction<FriendsFormat[]>>;
	searchValue: string;
	setSearchValue : Dispatch<SetStateAction<string>>;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
}

const UserList : React.FC<PropsUserList> = (props) => {
	const existingChannels = props.existingChannels;
	const setJoiningChannel = props.setJoiningChannel;
	const friends = props.friends
	const searchValue = props.searchValue
	const searchUsers = props.searchUsers
	const friendRequestsReceived = props.friendRequestsReceived;
	const friendRequestsSent = props.friendRequestsSent;

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
			props.setFriendRequestsSent(friendRequestsSent => [...friendRequestsSent, user.id])
		}
	}

	const isThereAFriendshipRequestReceived = (id:number) => {

		for(let i = 0; i < friendRequestsReceived.length; i++ )
		{
			if (friendRequestsReceived[i].id === id)
				return true
		}
		return false
	}

	const catchFriendshipId = (id:number) => {
		for(let i = 0; i < friendRequestsReceived.length; i++ )
		{
			if (friendRequestsReceived[i].id === id)
				return friendRequestsReceived[i].friendshipId
		}
	}

	const isThereAFriendshipRequestSent = (id:number) => {
		for (let i = 0; i < friendRequestsSent.length; i++)
		{
			if (friendRequestsSent[i] === id)
				return true
		}
		return false;
	}

	var isFriend = false;
	var received = false;
	var sent = false;
	var friendshipId = 0;
	var friendshipInfo = {
		friendshipId : friendshipId,
		id : 0,
		username : "" ,
		pseudo : "" ,
		avatarId : "" ,
		status : 0
	}


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
							let statusIcon = (user_.status === 1 ? statusIconGreen : statusIconRed);
							friendshipId = Number(catchFriendshipId(user_.id));
							friendshipInfo = {
								friendshipId : friendshipId,
								id : user_.id,
								username : user_.username ,
								pseudo : user_.pseudo ,
								avatarId : user_.avatarId ,
								status : user_.status
							};
							if (Boolean(isAlreadyFriend(user_.id)) === true)
								isFriend = true;
							else if (Boolean(isThereAFriendshipRequestReceived(user_.id)) === true)
								received = true;
							else if (Boolean(isThereAFriendshipRequestSent(user_.id)) === true)
								sent = true;
							return <PrintFriend idMe={props.idMe} socket={props.socket} user={user_} statusIcon={statusIcon} isFriend={isFriend} received={received} sent={sent} sendFriendshipRequest={sendFriendshipRequest} friendshipInfo={friendshipInfo} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} key={user_.id} />
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
								friendshipInfo = {
									friendshipId : friend.friendshipId,
									id : friend.id,
									username : friend.username ,
									pseudo : friend.pseudo ,
									avatarId : friend.avatarId ,
									status : friend.status 
								}
								let statusIcon = (friend.status === 1 ? statusIconGreen : statusIconRed);
								return <PrintFriend idMe={props.idMe} socket={props.socket} user={friend} statusIcon={statusIcon} isFriend={true} received={false} sent={false} sendFriendshipRequest={sendFriendshipRequest} friendshipInfo={friendshipInfo} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} key={friend.id} />
							})
				}
			</div>
	)
}

export default UserList;