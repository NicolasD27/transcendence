import React, { Dispatch, SetStateAction} from 'react';
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import PrintChannels from './PrintChannels';
import { PropsStateChannel } from './ChatSectionUsers'
import { FriendsFormat } from './Chat'
import { PropsStateUsers } from './ChatSectionUsers'
import { chatStateFormat } from '../App'
import PrintFriend from './PrintFriend';

interface  PropsUserList {
	idMe : number;
	socket : any;
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
	const joinedChannels = props.joinedChannels;
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
		return false
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
						let isFriend = false;
						let received = false;
						let sent = false;
						let friendshipId = 0;
						let friendshipInfo = {
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
						{
							received = true;
							friendshipId = Number(catchFriendshipId(user_.id))
							friendshipInfo = {
								friendshipId : friendshipId,
								id : user_.id,
								username : user_.username ,
								pseudo : user_.pseudo ,
								avatarId : user_.avatarId ,
								status : user_.status 
							}
						}
						else if (Boolean(isThereAFriendshipRequestSent(user_.id)) === true)
							sent = true;
						return <PrintFriend user={user_} statusIcon={statusIcon} isFriend={isFriend} received={received} sent={sent} sendFriendshipRequest={sendFriendshipRequest} friends={props.friends} friendshipInfo={friendshipInfo} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} key={user_.id} />
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
							let friendshipId = 0;
							let friendshipInfo = {
								friendshipId : friendshipId,
								id : friend.id,
								username : friend.username ,
								pseudo : friend.pseudo ,
								avatarId : friend.avatarId ,
								status : friend.status 
							}
							let statusIcon = (friend.status === 1 ? statusIconGreen : statusIconRed);
							return <PrintFriend user={friend} statusIcon={statusIcon} isFriend={true} received={false} sent={false} sendFriendshipRequest={sendFriendshipRequest} friends={props.friends} friendshipInfo={friendshipInfo} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} key={friend.id} />
						})
			}
		</div>
	)
}

export default UserList;