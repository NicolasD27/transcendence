import React, { Dispatch, SetStateAction} from 'react';
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import PrintChannelsJoined from './PrintChannelsJoined';
import PrintChannelsToJoin from './PrintChannelsToJoin';
import PrintInvitationSentProfile from './PrintInvitationSentProfile'
import PrintUserFriendRequestReceived from './PrintUserFriendRequestReceived'
import PrintSendFriendRequestProfile from './PrintSendFriendRequestProfile'
import PrintFriendProfile from './PrintFriendProfile'
import { PropsStateChannel } from './ChatSectionUsers'
import { FriendsFormat } from './Chat'
import { PropsStateUsers } from './ChatSectionUsers'
import { chatStateFormat } from '../App'

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
						if (Boolean(isAlreadyMember(channel.id)) === true)
							return <PrintChannelsJoined channel={channel} /*chatChannelState={props.chatChannelState} */setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} key={channel.id}/>
						else
							return <PrintChannelsToJoin channel={channel} joinedChannels={joinedChannels} setJoiningChannel={setJoiningChannel} key={channel.id}/>
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
						if (Boolean(isThereAFriendshipRequestSent(user_.id)) === true)
						{
							return (
								<PrintInvitationSentProfile user={user_} statusIcon={statusIcon} key={user_.id}/>
							)
						}
						else if (Boolean(isThereAFriendshipRequestReceived(user_.id)) === true)
						{
							let friendshipId = Number(catchFriendshipId(user_.id))
							let friendshipInfo = {
								friendshipId : friendshipId,
								id : user_.id,
								username : user_.username ,
								pseudo : user_.pseudo ,
								avatarId : user_.avatarId ,
								status : user_.status }
							
							return (
								<PrintUserFriendRequestReceived user={user_} statusIcon={statusIcon} /*acceptFriendshipRequest={acceptFriendshipRequest} declineFriendshipRequest={declineFriendshipRequest}*/ friendshipInfo={friendshipInfo} key={user_.id}/>
							)
						}
						else if (Boolean(isAlreadyFriend(user_.id)) === true)
						{
							return (
								<PrintFriendProfile friends={props.friends} user={user_} statusIcon={statusIcon} key={user_.id} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}/>
							)
						}
						else
							return (
								<PrintSendFriendRequestProfile user={user_} statusIcon={statusIcon} sendFriendshipRequest={sendFriendshipRequest} key={user_.id}/>
							)
					})
			}
			{
				!searchValue && 
					props.joinedChannels
						.map((channel) => {
							return (
								<PrintChannelsJoined channel={channel} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} key={channel.id}/>
							)
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
							let statusIcon = (friend.status === 1 ? statusIconGreen : statusIconRed);
							return (
								<PrintFriendProfile friends={props.friends} user={friend} statusIcon={statusIcon} key={friend.id} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}/>
							)
						})
			}
		</div>
	)
}

export default UserList;