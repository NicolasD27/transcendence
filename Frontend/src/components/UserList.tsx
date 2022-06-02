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

interface  PropsUserList {
	idMe : number;
	existingChannels: PropsStateChannel[];
	joinedChannels : PropsStateChannel[]
	setJoiningChannel: Dispatch<SetStateAction<boolean>>;
	searchUsers : PropsStateUsers[];
	friends: FriendsFormat[];
	setFriends : Dispatch<SetStateAction<FriendsFormat[]>>;
	/*friendRequestReceived : number;
	setFriendRequestReceived :  Dispatch<SetStateAction<number>>;*/
	searchValue: string;
	setSearchValue : Dispatch<SetStateAction<string>>;
	setChatFriendState : Dispatch<SetStateAction<boolean>>;
	chatChannelState : boolean;
	setChatChannelState : Dispatch<SetStateAction<boolean>>;
}

const UserList : React.FC<PropsUserList> = (props) => {
	const existingChannels = props.existingChannels;
	const joinedChannels = props.joinedChannels;
	const setJoiningChannel = props.setJoiningChannel;
	const friends = props.friends
	const searchValue = props.searchValue
	const searchUsers = props.searchUsers
	//const friendRequestReceived = props.friendRequestReceived;

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

	/*const sendFriendshipRequest = (user:PropsStateUsers) => {
		axios
			.post(dataUrlFriendRequestsSent, user)
			.then((response) => {
				setFriendRequestsSent(response.data)
			})
	}*/

	/*const isThereAFriendshipRequest = (id:number) => {
		for (const userId of friendRequestReceived) {
			if (userId === id)
				return true
		}
		return false
	}
*/
	/*const isThereAFriendshipRequestSent = (id:number) => {
		for (var i = 0; i < friendRequestsSent.length; i++)
		{
			if (friendRequestsSent[i].id === id)
				return true
		}
		return false
	}*/

	/*const acceptFriendshipRequest = (user:PropsStateUsers) => {
		axios
			.post(dataUrlFriends, user)
			.then((res) => {
				setFriends(res.data)
				axios.delete(`${dataUrlFriendRequestsReceived}/${res.data.id}`)
			})
			.catch((err) =>
				console.log(err)
			)
	}

	const declineFriendshipRequest = (user:PropsStateUsers) => {
		axios
			.delete(`${dataUrlFriendRequestsReceived}/${user.id}`)
			.catch((err) =>
				console.log(err)
			)
	}*/
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
							return <PrintChannelsJoined channel={channel} chatChannelState={props.chatChannelState} setChatChannelState={props.setChatChannelState} key={channel.id}/>
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
						if (Boolean(isAlreadyFriend(user_.id)) === true)
						{
							return (
								<PrintFriendProfile friends={props.friends} user={user_} statusIcon={statusIcon} key={user_.id} setChatFriendState={props.setChatFriendState} setFriends={props.setFriends}/>
							)
						}
						/*else if (Boolean(isThereAFriendshipRequest(user_.id)) === true)
						{
							return (
								<PrintUserFriendRequestReceived user={user_} statusIcon={statusIcon} acceptFriendshipRequest={acceptFriendshipRequest} declineFriendshipRequest={declineFriendshipRequest} key={user_.id}/>
							)
						}*/
						/*else if (Boolean(isThereAFriendshipRequestSent(user.id)) === true)
						{
							return (
								<PrintInvitationSentProfile user={user} statusIcon={status} key={user.id}/>
							)
						}*/
						else
							return (
								<PrintSendFriendRequestProfile user={user_} statusIcon={statusIcon} /*sendFriendshipRequest={sendFriendshipRequest}*/ key={user_.id}/>
							)
					})
			}
			{
				!searchValue && 
					props.joinedChannels
						.map((channel) => {
							return (
								<PrintChannelsJoined channel={channel} chatChannelState={props.chatChannelState} setChatChannelState={props.setChatChannelState} key={channel.id}/>
							)
						})
			}
			{
					!searchValue &&
					friends
						.map((friend) => {
							let statusIcon = (friend.status === 1 ? statusIconGreen : statusIconRed);
							return (
								<PrintFriendProfile friends={props.friends} user={friend} statusIcon={statusIcon} key={friend.id} setChatFriendState={props.setChatFriendState} setFriends={props.setFriends}/>
							)
						})
			}
		</div>
	)
}

export default UserList;