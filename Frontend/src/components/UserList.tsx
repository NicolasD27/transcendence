import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import PrintChannelsJoined from './PrintChannelsJoined';
import PrintChannelsToJoin from './PrintChannelsToJoin';
import PrintInvitationSentProfile from './PrintInvitationSentProfile'
import PrintUserFriendRequestReceived from './PrintUserFriendRequestReceived'
import PrintSendFriendRequestProfile from './PrintSendFriendRequestProfile'
import PrintFriendProfile from './PrintFriendProfile'
import { PropsStateChannel } from './ChatSectionUsers'
import { FriendsFormat } from './ChatSectionUsers'
import { PropsStateUsers } from './ChatSectionUsers'
import { chatStateFormat } from '../pages/Body'

interface  PropsUserList {
	idMe : number;
	socket : any;
	existingChannels: PropsStateChannel[];
	joinedChannels : PropsStateChannel[]
	setJoiningChannel: Dispatch<SetStateAction<boolean>>;
	searchUsers : PropsStateUsers[];
	friends: FriendsFormat[];
	setFriends : Dispatch<SetStateAction<FriendsFormat[]>>;
	friendRequestsSent : number[];
	setFriendRequestsSent : Dispatch<SetStateAction<number[]>>;
	friendRequestReceived : number[];
	setFriendRequestReceived :  Dispatch<SetStateAction<number[]>>;
	searchValue: string;
	setSearchValue : Dispatch<SetStateAction<string>>;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	/*chatChannelState : boolean;
	setChatChannelState : Dispatch<SetStateAction<boolean>>;*/
}

const UserList : React.FC<PropsUserList> = (props) => {
	const existingChannels = props.existingChannels;
	const joinedChannels = props.joinedChannels;
	const setJoiningChannel = props.setJoiningChannel;
	const friends = props.friends
	const searchValue = props.searchValue
	const searchUsers = props.searchUsers
	const friendRequestReceived = props.friendRequestReceived;
	const [ friendRequestsSent, setFriendRequestsSent ] = useState<number[]>([])


	const isAlreadyFriend = (id:number) => {
		for(var i = 0; i < friends.length; i++ )
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
			setFriendRequestsSent(friendRequestsSent => [...friendRequestsSent, user.id])
		}
	}

	const isThereAFriendshipRequestReceived = (id:number) => {
		for (const userId of friendRequestReceived) {
			if (userId === id)
				return true
		}
		return false
	}

	const isThereAFriendshipRequestSent = (id:number) => {
		for (var i = 0; i < friendRequestsSent.length; i++)
		{
			if (friendRequestsSent[i] === id)
				return true
		}
		return false
	}

	const acceptFriendshipRequest = (id:number) => {
			if (props.idMe)
				props.socket.emit("acceptFriendRequest", {})
	}

	const declineFriendshipRequest = (user:PropsStateUsers) => {
		/*axios
			.delete(`${dataUrlFriendRequestsReceived}/${user.id}`)
			.catch((err) =>
				console.log(err)
			)*/
	}

	return (
			<div className='usersList'>
			{
				searchValue !== ""
				&& existingChannels
					.filter((channel) => {
						return channel.name.toLowerCase().includes(searchValue.toLowerCase())
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
					})
					.map((user_) => {
						let statusIcon = (user_.status === 1 ? statusIconGreen : statusIconRed);
						if (Boolean(isThereAFriendshipRequestReceived(user_.id)) === true)
						{
							return (
								<PrintUserFriendRequestReceived user={user_} statusIcon={statusIcon} acceptFriendshipRequest={acceptFriendshipRequest} declineFriendshipRequest={declineFriendshipRequest} key={user_.id}/>
							)
						}
						else if (Boolean(isThereAFriendshipRequestSent(user_.id)) === true)
						{
							return (
								<PrintInvitationSentProfile user={user_} statusIcon={statusIcon} key={user_.id}/>
							)
						}
						else if (Boolean(isAlreadyFriend(user_.id)) === true)
						{
							return (
								<PrintFriendProfile friends={props.friends} user={user_} statusIcon={statusIcon} key={user_.id} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} setFriends={props.setFriends}/>
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
								<PrintChannelsJoined channel={channel} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState}/*setChatChannelState={props.setChatChannelState}*/ key={channel.id}/>
							)
						})
			}
			{
					!searchValue &&
					friends
						.filter(friend => {
							if (friend.id !== props.idMe)
								return friend;
						})
						.map((friend) => {
							let statusIcon = (friend.status === 1 ? statusIconGreen : statusIconRed);
							return (
								<PrintFriendProfile friends={props.friends} user={friend} statusIcon={statusIcon} key={friend.id} setChatParamsState={props.setChatParamsState}  chatParamsState={props.chatParamsState} setFriends={props.setFriends}/>
							)
						})
			}
		</div>
	)
}

export default UserList;