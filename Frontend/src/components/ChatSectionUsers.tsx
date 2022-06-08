import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import axios from 'axios';
import UserList from './UserList';
import SearchBarAddGroup from './SearchBarAddGroup'
import { isConstructorDeclaration } from 'typescript';
import { chatStateFormat } from '../App'
import { FriendsFormat } from '../components/Chat'

interface PropsSectionUsers {
	socket : any;
	idMe : number;
	//users : PropsStateUsers[];
	//setUsers : Dispatch<SetStateAction<PropsStateUsers[]>>;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
	friends : FriendsFormat[];
	friendRequestsSent : number[];
	setFriendRequestsSent : Dispatch<SetStateAction<number[]>>;
	friendRequestReceived : FriendsFormat[];
	setFriendRequestReceived :  Dispatch<SetStateAction<FriendsFormat[]>>;
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


export interface PropsStateChannel {
	id : number;
	isProtected : boolean;
	name : string;
	description : string;
}

const ChatSectionUsers : React.FC<PropsSectionUsers> = (props) => {
	const [ searchUsers, setSearchUsers ] = useState<PropsStateUsers[]>([])
	const [ joinedChannels, setJoinedChannels ] = useState<PropsStateChannel[]>([])
	const [ joiningChannel, setJoiningChannel ] = useState(false)
	const [ existingChannels, setExistingChannels ] = useState<PropsStateChannel[]>([])
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

	return (
		<div className='chatArea'>
			<SearchBarAddGroup idMe={props.idMe} setSearchValue={setSearchValue} friends={props.friends} createChannelButtonState={createChannelButtonState} setCreateChannelButtonState={setCreateChannelButtonState}/>
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
					friends={props.friends}
					friendRequestsSent={props.friendRequestsSent}
					setFriendRequestsSent={props.setFriendRequestsSent}
					friendRequestReceived={props.friendRequestReceived}
					setFriendRequestReceived={props.setFriendRequestReceived}
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					setChatParamsState={props.setChatParamsState}
					chatParamsState={props.chatParamsState}
					setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}
					/*chatChannelState={props.chatChannelState}
					setChatChannelState={props.setChatChannelState}*/
				/>
			}
		</div>
	)
}

export default ChatSectionUsers;