import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import axios from 'axios';
import UserList from './UserList';
import SearchBarAddGroup from './SearchBarAddGroup'

interface PropsUsers {
	socket : any;
	idMe : number;
	//users : PropsStateUsers[];
	//setUsers : Dispatch<SetStateAction<PropsStateUsers[]>>;
	setChatFriendState : Dispatch<SetStateAction<boolean>>;
	chatChannelState : boolean;
	setChatChannelState : Dispatch<SetStateAction<boolean>>;
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

const ChatSectionUsers : React.FC<PropsUsers> = (props) => {
	const [ searchUsers, setSearchUsers ] = useState<PropsStateUsers[]>([])
	const [ friends, setFriends ] = useState<FriendsFormat[]>([])
	const [ joinedChannels, setJoinedChannels ] = useState<PropsStateChannel[]>([])
	const [ joiningChannel, setJoiningChannel ] = useState(false)
	const [ existingChannels, setExistingChannels ] = useState<PropsStateChannel[]>([])
	const [ friendsState, setFriendsState ] = useState(false)

	const [ friendRequestsSent, setFriendRequestsSent ] = useState<number>()
	//const [ friendRequestReceived, setFriendRequestReceived ] = useState(0)
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
		console.log("joinedChannel")
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
		if (props.idMe !== 0)
		{
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.idMe}`, { withCredentials: true })
				.then (res => {
				 	let friend = res.data;
					friend.map((list:any) => {
						let friends_tmp : FriendsFormat;
						friends_tmp = { friendshipId: list.id , id : list.following.id ,  username : list.following.username, pseudo : list.following.pseudo, avatarId : list.following.avatarId, status : list.following.status }
						setFriends(friends => [...friends, friends_tmp])
					})
				})
				.catch (err =>
					console.log(err)
				)
		}}, [props.idMe])

	/*useEffect(() => {
		props.socket.on("notifyFriendReques", (data) => {setFriendRequestReceived(data.user2_id)})
	}, [props.socket])/*[friendRequestReceived])*/

	/*useEffect(() => {
		axios
		.get(dataUrlFriendRequestsSent, { withCredentials: true })
		.then (res => {
			const request = res.data;
			setFriendRequestsSent(request)
		})
		.catch (err => {
			console.log(err)
		})
	}, [friendRequestsSent])*/

	/*interface PropsuserList {
		existingChannels : PropsStateChannel[];
		//joinedChannels : ;
	}*/


	return (
		<div className='chatArea'>
			<SearchBarAddGroup setSearchValue={setSearchValue} friends={friends} createChannelButtonState={createChannelButtonState} setCreateChannelButtonState={setCreateChannelButtonState}/>
			{
				!createChannelButtonState && 
				<UserList 
					idMe={props.idMe}
					existingChannels={existingChannels}
					joinedChannels={joinedChannels}
					setJoiningChannel={setJoiningChannel}
					//setJoinedChannels={setJoinedChannels}
					searchUsers={searchUsers}
					friends={friends}
					setFriends={setFriends}
					/*friendRequestsSent={friendRequestsSent}
					setFriendRequestsSent={setFriendRequestsSent}
					friendRequestReceived={friendRequestReceived}
					setFriendRequestReceived={setFriendRequestReceived}*/
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					setChatFriendState={props.setChatFriendState}
					chatChannelState={props.chatChannelState}
					setChatChannelState={props.setChatChannelState}
				/>
			}
		</div>
	)
}

export default ChatSectionUsers;