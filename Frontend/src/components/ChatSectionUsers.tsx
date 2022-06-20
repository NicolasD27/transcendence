import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import axios from 'axios';
import UserList from './UserList';
import SearchBarAddGroup from './SearchBarAddGroup'
import { chatStateFormat } from '../App'
import { FriendsFormat } from '../components/Chat'
import OngoingMatch from '../components/OngoingMatch'

interface PropsSectionUsers {
	socket : any;
	idMe : number;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
	friends : FriendsFormat[];
	friendRequestsSent : number[];
	setFriendRequestsSent : Dispatch<SetStateAction<number[]>>;
	friendRequestsReceived : FriendsFormat[];
	setFriendRequestsReceived :  Dispatch<SetStateAction<FriendsFormat[]>>;
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
	const [ chatGamesState, setChatGameState ] = useState(true)

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
	}, [searchValue])

	return (
		<div className='chatArea'>
			<div className='switchMode'>
				<button onClick={() => setChatGameState(true)} className="switchButton">Chat</button>
				<span></span>
				<button onClick={() => setChatGameState(false)} className="switchButton">Ongoing Match</button>
			</div>
			{ 
			 	chatGamesState &&
				<>
					<SearchBarAddGroup idMe={props.idMe} setSearchValue={setSearchValue} friends={props.friends} createChannelButtonState={createChannelButtonState} setCreateChannelButtonState={setCreateChannelButtonState} chatParamsState={props.chatParamsState} setChatParamsState={props.setChatParamsState} />
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
							friendRequestsReceived={props.friendRequestsReceived}
							setFriendRequestsReceived={props.setFriendRequestsReceived}
							searchValue={searchValue}
							setSearchValue={setSearchValue}
							setChatParamsState={props.setChatParamsState}
							chatParamsState={props.chatParamsState}
							setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}
							/*chatChannelState={props.chatChannelState}
							setChatChannelState={props.setChatChannelState}*/
						/>
					}
				</>
			}
			{
				!chatGamesState &&
				<OngoingMatch/>
			}
		</div>
	)
}

export default ChatSectionUsers;