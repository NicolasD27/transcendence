import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import mainTitle from '../asset/Pong-Legacy.svg';
import searchIcon from '../asset/searchIcon.svg';
import addGroupIcon from "../asset/addGroupIcon.svg"
import { cp } from 'fs/promises';
import statutIconGreen from "../asset/statutIconGreen.svg"
import statutIconRed from "../asset/statutIconRed.svg"
import user1 from "../asset/friend1.svg"
import playIcon from "../asset/PlayIcon_blue.svg"
import Avatar from '../components/Avatar';
import CloseChatWindow from '../asset/CloseChatWindow.svg'
import { Channel, channel } from 'diagnostics_channel';
import { collapseTextChangeRangesAcrossMultipleVersions, createEmitAndSemanticDiagnosticsBuilderProgram } from 'typescript';
import { join } from 'path';

const dataUrlChannelsJoined = "http://localhost:8000/api/channels/"
const dataUrlExistingChannel = "http://localhost:8000/api/channels"
const dataUrlFriends = "http://localhost:8000/api/friendships/"

//////////////////////////////
//const dataUrlFriendRequestsSent = "http://localhost:3001/friendRequestsSent"
//const dataUrlFriendRequestsReceived = "http://localhost:3001/friendRequestsReceived"
//////////////////////////////


const dataUrlUsers = "http://localhost:8000/api/users"
//import gameArea from '../asset/gameArea.svg';

const PrintFriendToAddChannel = (props:any) => {

	/*const checkSelectionStatus = (user:any) => {

		if (props.selectedFriend.filter((friend:any) => friend.id === user.id).length === 0){
			var newarrayadding = [...props.selectedFriend, user]
			props.setSelectedFriend(newarrayadding)
		}
		else{
			var newarraydeletion = props.selectedFriend.filter((friend:any) => friend.id !== user.id)
			props.setSelectedFriend(newarraydeletion)
		}
	}*/

	return (
		/*props.friends
			.map((user:any) => {
				let status = (user.status === "online" ? statutIconGreen : statutIconRed)
				return (
					<div className='user' key={user.id}>
						<div id='userAvatarIcon'>
							<img src={user1} className="userAvatar" alt="userAvatar"/>
							<img src={status} className="userStatutIcon" alt="StatutIcon"/>
						</div>
						<div id="username">{user.username}</div>
						<div className='checkbox_addToChannel'>
							<input type='checkbox' name="addFriendToChannelButton" id={user.id} onChange={() => checkSelectionStatus(user)}/>
							<label htmlFor={user.id}></label>
						</div>
					</div>
				)
			})*/
			null
	)
}

const SearchBarAddGroup = (props:any) => {

	const [ selectedFriend, setSelectedFriend ] = useState([])

	const handleSearchRequest = (e:any) => {
		props.setSearchValue("")
		let value = e.target.value
		props.setSearchValue(value)
	}

	const handleClick = (e:any) => {
		props.setCreateChannelButtonState(!props.createChannelButtonState)
	}

	const createChannel = (e:any) => {
		console.log("Create Channel Button hit")
	}

	/*useEffect(() => {
		console.log('selectedFriend: ' , selectedFriend)
	}, [selectedFriend])*/

	return (
		<>
			<div className="searchAndAdd">
				<div id="searchBar">
					<img src={searchIcon} alt="searchIcon" id='searchIcon'/>
					<input type='text' placeholder='Search...' name='searchFriend' id='searchFriend' onChange={handleSearchRequest} />
				</div>
				<button id='addGroup' onClick={handleClick}/>
			</div>
			{
				props.createChannelButtonState && 
				<>
					<div className='usersList'>
						<PrintFriendToAddChannel friends={props.friends} selectedFriend={selectedFriend} setSelectedFriend={setSelectedFriend}/>
					</div>
					<button id="checkbox_createChannelButton" formMethod='post' type="button" onClick={createChannel}>Create Channel</button>
				</>
			}
		</>
	)
	//<input type="button" id="createChannelButton" value="Create Channel" onClick={handleClick1}/>
}

interface PropsPrintNormalFriendProfile {
	user : PropsStateUsers;
	setFriendDeleteColumnState : Dispatch<SetStateAction<boolean>>;
	setChatFriendState :  Dispatch<SetStateAction<boolean>>;
	isBlocked : boolean;
	setIsBlocked : Dispatch<SetStateAction<boolean>>;
}

const PrintNormalProfile : React.FC<PropsPrintNormalFriendProfile> = (props) => {
	
	return (
		<>
			<div id="username">{props.user.pseudo}</div>
					<div id='friend_buttons'>
						{(!props.isBlocked &&
							<>
								<button id="friendPlay_button" onClick={() => ""}/>
								<button id="friendChat_button" onClick={() => props.setChatFriendState(true)}/> 
							</>
						) ||
							<div id='profileBlocked'>
								Blocked
							</div>
						}
						<button id="friendColumn_button" onClick={() => props.setFriendDeleteColumnState(true)}/>
					</div>
		</>
	)
}

const PrintUnfriendBlockProfile = (props:any) => {
	return (
		<>
			<div className='optionButtons'>
				<button id='unfriend_button' onClick={() => props.deleteFriend(props.user)}>
						<p>Unfriend</p>
				</button>
				{
						(!props.isBlocked && 
						(<button id='block_buttons' onClick={() => props.setIsBlocked(true)}>
							Block
						</button>)) ||
						(<button id='block_buttons' onClick={() => props.setIsBlocked(false)}>
							Unblock
						</button>)
				}
			</div>
			<button id="unfriendColumnButton" onClick={() => props.setFriendDeleteColumnState(false)}/>
		</>
	)
}

interface PropsPrintFriendProfile {
	//friendshipId: number;
	user:  PropsStateUsers;
	statusIcon: string;
	key: number;
	setChatFriendState :  Dispatch<SetStateAction<boolean>>;
	setFriends : Dispatch<SetStateAction<FriendsFormat[]>>;
}

const PrintFriendProfile : React.FC<PropsPrintFriendProfile> = (props) => {

	const [ friendDeleteColumnState, setFriendDeleteColumnState ] = useState(false)	
	const [ isBlocked, setIsBlocked ]= useState(false)
	const [ profileAvatar, setProfileAvatar ] = useState("")

	const defaultAvatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	const navigate = useNavigate()
	
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	useEffect(() => {
		console.log("Pseudo: ", props.user.pseudo)
		console.log("id: ", props.user.id)
		console.log("avatarId:" , props.user.avatarId)
		if (props.user.avatarId != null)
		{
			console.log("catching avatar !!")
			setProfileAvatar(`http://localhost:8000/api/database-files/${props.user.avatarId}`)
		}
	}, [])

	const deleteFriend = (user:any) => {
			/*props.user.filter((friend) => {

			})*/
		axios
			.delete(`http://localhost:8000/api/friendships/${user.friendshipId}`, { withCredentials: true })
			.catch((err) => 
				console.log(err))
	}

	return (
		<div className='user'>
				<div id='userAvatarIcon'>
					{
						props.user.avatarId == null && 
						<img src={defaultAvatar} className="userAvatar" alt="defaultAvatar" onClick={() => onProfil(props.user.id.toString())}/>
					}
					{
						props.user.avatarId != null &&
						<img src={profileAvatar} className="userAvatar" alt="profileAvatar" onClick={() => onProfil(props.user.id.toString())}/>
					}
					<img src={props.statusIcon} className="userStatusIcon" alt="StatusIcon"/>
				</div>
			{!friendDeleteColumnState && <PrintNormalProfile user={props.user} setFriendDeleteColumnState={setFriendDeleteColumnState} setChatFriendState={props.setChatFriendState} isBlocked={isBlocked} setIsBlocked={setIsBlocked}/>}
			{friendDeleteColumnState && <PrintUnfriendBlockProfile user={props.user} setFriendDeleteColumnState={setFriendDeleteColumnState} deleteFriend={deleteFriend} isBlocked={isBlocked} setIsBlocked={setIsBlocked}/>}
		</div>
	)
}

const PrintUserFriendRequestReceived = (props:any) => {
	const [ profileAvatar, setProfileAvatar ] = useState("")

	const navigate = useNavigate()
	
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	const defaultAvatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	
	useEffect(() => {
		if (props.user.avatarId != null)
			setProfileAvatar(`http://localhost:8000/api/database-files/${props.user.avatarId}`)
	}, [])

	return (
		<>
			<div className='user'>
				<div id='userAvatarIcon'>
				{
						props.user.avatarId == null && 
						<img src={defaultAvatar} className="userAvatar" alt="defaultAvatar" onClick={() => onProfil(props.user.id.toString())}/>
					}
					{
						props.user.avatarId != null &&
						<img src={profileAvatar} className="userAvatar" alt="profileAvatar" onClick={() => onProfil(props.user.id.toString())}/>
					}
					<img src={props.statusIcon} className="userStatusIcon" alt="StatutIcon"/>
				</div>
				<div id="username">{props.user.pseudo}</div>
				<div id='friendRequest_buttons'>
					<button id="AcceptFriendButton" onClick={() => props.acceptFriendshipRequest(props.user)} /> 
					<button id="DeclineFriendButton" onClick={() => props.declineFriendshipRequest(props.user)} /> 
				</div>
			</div>
		</>
	)
}

const PrintInvitationSentProfile = (props:any) => {
	const [ profileAvatar, setProfileAvatar ] = useState("")

	const defaultAvatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	
	const navigate = useNavigate()
	
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	useEffect(() => {
		if (props.user.avatarId != null)
			setProfileAvatar(`http://localhost:8000/api/database-files/${props.user.avatarId}`)
	}, [])

	return (
		<>
			<div className='user'>
				<div id='userAvatarIcon'>
					{
						props.user.avatarId == null && 
						<img src={defaultAvatar} className="userAvatar" alt="defaultAvatar" onClick={() => onProfil(props.user.id.toString())}/>
					}
					{
						props.user.avatarId != null &&
						<img src={profileAvatar} className="userAvatar" alt="profileAvatar" onClick={() => onProfil(props.user.id.toString())}/>
					}
					<img src={props.statusIcon} className="userStatusIcon" alt="StatutIcon"/>
				</div>
				<div id="username">{props.user.pseudo}</div>
				<div id='invitation_sent'>
					Invitation Sent
				</div>
			</div>
		</>
	)
}

const PrintSendFriendRequestProfile = (props:any) => {
	const [ profileAvatar, setProfileAvatar ] = useState("")

	const defaultAvatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	
	const navigate = useNavigate()
	
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	useEffect(() => {
		console.log(props.user.avatarId)
		if (props.user.avatarId != null)
			setProfileAvatar(`http://localhost:8000/api/database-files/${props.user.avatarId}`)
	}, [])

	return (
		<>
			<div className='user'>
				<div id='userAvatarIcon'>
					{
						props.user.avatarId == null && 
						<img src={defaultAvatar} className="userAvatar" alt="defaultAvatar" onClick={() => onProfil(props.user.id.toString())}/>
					}
					{
						props.user.avatarId != null &&
						<img src={profileAvatar} className="userAvatar" alt="profileAvatar" onClick={() => onProfil(props.user.id.toString())}/>
					}
					<img src={props.statusIcon} className="userStatusIcon" alt=" StatutIcon"/>
				</div>
				<div id="username">{props.user.pseudo}</div>
				<button id="SendFriendRequest_buttons" onClick={() => props.sendFriendshipRequest(props.user)}/>  
			</div>
		</>
	)
}

const PrintChannelsJoined = ({channel, chatChannelState, setChatChannelState}:any) => {
	const [ isMute, setIsMute ]= useState(false)

	return (
		<div className='channel'>
			<div id='channelAvatarIcon'></div>
			<div id="channelName">{channel.name}</div>
			<div id="channel_buttons">
				{
					!isMute && <button id="muteChannel" onClick={() => setIsMute(true)}/> ||
					<button id="unmuteChannel" onClick={() => setIsMute(false)}/>
				}
				<button id="channelChat_button" onClick={() => setChatChannelState(!chatChannelState)}/> 
			</div>
		</div>
	)
}

const PrintChannelsToJoin = ({channel, setJoinedChannels}:any) => {
	const [ isButtonClicked, setIsButtonClicked ] = useState(false)
	const [ enteredPassword, setEnteredPassword ] = useState("")

	const handleEnteredPassword = (e:any) => {
		setEnteredPassword(e.target.value);
	}

	const checkPassword = () => {
		if (channel.password === enteredPassword)
			return true
		else
			return false
	}

	return (
		<div className='channel'>
			<div id='channelAvatarIcon'></div>
			{
				(!isButtonClicked &&
					( 
						<>
							<div id="channelName">{channel.name}</div>
							<button id="channelSendRequest_buttons" onClick={() => setIsButtonClicked(true)}/>
						</>
					)
				) ||
				(
					(channel.password === "private" && 
					<div id="channelPassword">
						<input type="password" placeholder="Password" onChange={handleEnteredPassword} required/>
						<button id="confirmPassword" onClick={() => checkPassword()}/>
					</div>) || (
							axios
								.post(dataUrlChannelsJoined, channel,  { withCredentials: true })
								.then((res) => {
									setJoinedChannels(res.data)
								})
								.catch((err) => 
									console.log(err)
								)
					)
				)
			}
		</div>
	)
}

interface  PropsUserList {
	idMe : number;
	users : PropsStateUsers[];
	setUsers : Dispatch<SetStateAction<PropsStateUsers[]>>;
	friends: FriendsFormat[];
	setFriends : Dispatch<SetStateAction<FriendsFormat[]>>;
	searchValue: string;
	setSearchValue : Dispatch<SetStateAction<string>>;
	setChatFriendState : Dispatch<SetStateAction<boolean>>;
}
/*{/*existingChannels, joinedChannels, users, setUsers, friends, setFriends/*, friendRequestsSent, setFriendRequestsSent, friendRequestReceived, setFriendRequestReceived, searchValue, setSearchValue, setJoinedChannels, setChatFriendState, chatChannelState, setChatChannelState}*/
const UserList : React.FC<PropsUserList> = (props) => {

	/*const isAlreadyMember = (channelId: any) => {
		for (var i = 0; i < joinedChannels.length; i++)
		{
			if (joinedChannels[i].id === channelId)
				return true
		}
		return false
	}*/

	/*const sendFriendshipRequest= (user:any) => {
		axios
			.post(dataUrlFriendRequestsSent, user)
			.then((response) => {
				setFriendRequestsSent(response.data)
			})
	}*/

	const friends = props.friends
	const searchValue = props.searchValue
	const users = props.users

	const isAlreadyFriend = (id: any) => {
		for(var i = 0; i < friends.length; i++ )
		{
			if (friends[i].id === id)
				return true
		}
		return false
	}

	/*const isThereAFriendshipRequest = (id: any) => {
		for (const user of friendRequestReceived) {
			if (user.id === id)
				return true
		}
		return false
	}

	const isThereAFriendshipRequestSent = (id: any) => {
		for (var i = 0; i < friendRequestsSent.length; i++)
		{
			if (friendRequestsSent[i].id === id)
				return true
		}
		return false
	}*/

	/*const acceptFriendshipRequest = (user:any) => {
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

	const declineFriendshipRequest = (user:any) => {
		axios
			.delete(`${dataUrlFriendRequestsReceived}/${user.id}`)
			.catch((err) => 
				console.log(err)
			)
	}*/

	return (
			<div className='usersList'>
			{
				/*searchValue !== ""
				&& existingChannels
					.filter((channel:any) => {
						return channel.name.toLowerCase().includes(searchValue.toLowerCase())
					})
					.map((channel:any) => {
						if (Boolean(isAlreadyMember(channel.id)) === true)
						{
							return <PrintChannelsJoined channel={channel} chatChannelState={chatChannelState} setChatChannelState={setChatChannelState} key={channel.id}/>
						}
						else {
							return <PrintChannelsToJoin channel={channel} setJoinedChannels={setJoinedChannels} key={channel.id}/>
						}
					})
		  */}
			{
				searchValue !== ""
				&& users
					.filter((user) => {
						if (user.id !== props.idMe)
							return user.pseudo.toLowerCase().includes(searchValue.toLowerCase())
						console.log("user: ", user)
					})
					.map((user) => {
						let statusIcon = (user.status === 1 ? statutIconGreen : statutIconRed);
						if (Boolean(isAlreadyFriend(user.id)) === true)
						{
							return (
								<PrintFriendProfile user={user} statusIcon={statusIcon} key={user.id} setChatFriendState={props.setChatFriendState} setFriends={props.setFriends} /*setSelectedUser={setSelectedUser}*//>
							)
							/*console.log("username: ", user.username)
							friends.
							return (
								<PrintFriendProfile user={user} statusIcon={statusIcon} key={user.id} setChatFriendState={setChatFriendState} setSelectedUser={setSelectedUser}/>
							)*/
						}
						/*else if (Boolean(isThereAFriendshipRequest(user.id)) === true)
						{
							return (
								null
								//<PrintUserFriendRequestReceived user={user} status={status} username={user.username} acceptFriendshipRequest={acceptFriendshipRequest} declineFriendshipRequest={declineFriendshipRequest} key={user.id}/>
							)
						}
						else if (Boolean(isThereAFriendshipRequestSent(user.id)) === true)
						{
							return (
								<PrintInvitationSentProfile user={user} status={status} username={user.username} key={user.id}/>
							)
						}*/
						else
							return (
								<PrintSendFriendRequestProfile user={user} statusIcon={statusIcon} /*sendFriendshipRequest={sendFriendshipRequest}*/ key={user.id}/>
							)
					})
			}
			{/*
				!searchValue && 
					(joinedChannels
						.map((channel:any) => {
								return (
									<PrintChannelsJoined channel={channel} chatChannelState={chatChannelState} setChatChannelState={setChatChannelState} key={channel.id}/>
								)
						}))
			*/}
			{
					!searchValue && 
					friends
						.map((user) => {
							let statusIcon = (user.status === 1 ? statutIconGreen : statutIconRed);
							return (
								<PrintFriendProfile /*friendshipId={user.friendshipId}*/ user={user} statusIcon={statusIcon} key={user.id} setChatFriendState={props.setChatFriendState} setFriends={props.setFriends}/>
							)
						})
			}
		</div>
	)
}

interface PropsUsers {
	idMe : number;
	users : PropsStateUsers[];
	setUsers : Dispatch<SetStateAction<PropsStateUsers[]>>;
	setChatFriendState : Dispatch<SetStateAction<boolean>>;
	chatChannelState : boolean;
	setChatChannelState : Dispatch<SetStateAction<boolean>>;
}

interface  PropsStateUsers {
	id : number;
	username : string;
	pseudo : string;
	avatarId : string;
	status : number;
}

interface FriendsFormat {
	//friendshipId : number;
	id : number;
	username : string;
	pseudo : string;
	avatarId : string;
	status : number;
}

interface PropsStateChannel {
	name : string;
	description : string;
	password : string;
	isPrivate : boolean;
}

const Users : React.FC<PropsUsers> = (props) => {
	const [ joinedChannels, setJoinedChannels ] = useState([])
	const [ existingChannels, setExistingChannels ] = useState([])
	const [ friends, setFriends ] = React.useState<FriendsFormat[]>([])
	const [ friendsState, setFriendsState ] = useState(false)

	const [ friendRequestsSent, setFriendRequestsSent ] = useState([])
	const [ friendRequestReceived, setFriendRequestReceived ] = useState([])
	const [ searchValue, setSearchValue ] = useState("")
	const [ createChannelButtonState, setCreateChannelButtonState ] = useState(false)

	/*useEffect(() => {
		axios
		.get(dataUrlChannelsJoined + `${1}`, { withCredentials: true })
		.then (res => {
			let channel = res.data;
			setJoinedChannels(channel)
		})
		.catch (err =>
			console.log(err)
		)
	}, [joinedChannels])

	useEffect(() => {
		axios
		.get(dataUrlExistingChannel , { withCredentials: true })
		.then (res => {
			let channel = res.data;
			setExistingChannels(channel)
		})
		.catch (err =>
			console.log(err)
		)
	}, [existingChannels])*/
	//const idMe = props.idMe;


	useEffect(() => {
		if (props.idMe !== 0)
		{
			setFriends([])
			axios
				.get(`http://localhost:8000/api/friendships/${props.idMe}`, { withCredentials: true })
				.then (res => {
					var friend = res.data;
					friend.map((list:any) => {
						let friends_tmp : FriendsFormat;
						friends_tmp = { /*friendshipId: list.id ,*/ id : list.following.id ,  username : list.following.username, pseudo : list.following.pseudo, avatarId : list.following.avatarId, status : list.following.status }
						setFriends(friends => [...friends, friends_tmp])
					})
				})
				.catch (err => 
					console.log(err)
				)
		}}, [props.idMe])

	/*useEffect(() => {
		axios
		.get(dataUrlFriendRequestsReceived, { withCredentials: true })
		.then (res => {
			const request = res.data;
			setFriendRequestReceived(request)
		})
		.catch (err => { 
			console.log(err)
		})
	}, [friendRequestReceived])

	useEffect(() => {
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
			<SearchBarAddGroup setSearchValue={setSearchValue} friends={friends} createChannelButtonState={null} setCreateChannelButtonState={null}/>
			{
				//!createChannelButtonState && 
				<UserList 
					idMe={props.idMe}
					/*existingChannels={existingChannels}
					joinedChannels={joinedChannels}*/
					users={props.users}
					setUsers={props.setUsers}
					friends={friends}
					setFriends={setFriends}
					/*friendRequestsSent={friendRequestsSent}
					setFriendRequestsSent={setFriendRequestsSent}
					friendRequestReceived={friendRequestReceived}
					setFriendRequestReceived={setFriendRequestReceived}*/
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					//setJoinedChannels={setJoinedChannels}
					setChatFriendState={props.setChatFriendState}
					/*chatChannelState={props.chatChannelState}
					setChatChannelState={props.setChatChannelState}*/
				/>
			}
		</div>
	)
}

const Chat = (props:any) => {
	const username = "Leslie Alexander"
	//const friendName = username.replace(/ /g, "\n");

	return (
		<div className='chatArea'>
			<div id='chatTop'>
				<div id='friendChatAvatarIcon'>
					<img src={user1} className="friendchatAvatar" alt="friendAvatar"/>
				</div>
				<div id="chatUsername">{username}</div>
				<button id='chatColumnButton' onClick={() => props.setChatFriendState(false)}/>
			</div>
			<div className='messageArea'></div>
			<div id="sendTextArea"> 
				<div id='writingTextArea'>
					<input type='text' placeholder='Aa' name='searchFriend'  /*onChange={handleSearchRequest}*/ />
				</div>
				<button id="sendTextIcon"/>
			</div>
		</div>
	)
}

interface PropsBody {
	idMe: number;
}

const Body : React.FC<PropsBody> = (props) => {

	const idMe = props.idMe;
	const [ users, setUsers ] = useState<PropsStateUsers[]>([])
	const [ chatFriendState, setChatFriendState ] = useState(false) 
	const [ chatChannelState, setChatChannelState ] = useState(false) 

	const  [ userstate, setUserState ] = useState(false);

	useEffect(() => {
		setUsers([])
		axios
			.get(dataUrlUsers , { withCredentials : true })
			.then (res => {
				const user = res.data;
				setUsers(user)
				console.log("users: ", user)
			})
			.catch (err => 
				console.log(err)
			)
	}, [])
		/*if (userstate === false) { 
			setUserState(true);
			axios
			.get(dataUrlUsers , { withCredentials : true })
			.then (res => {
				const user = res.data;
				setUsers(user)
			})
			.catch (err => 
				console.log(err)
			)
		}*/
	

	return (
		<section id="gameAndChatSection">
			<div className='gameArea'><div className='gameAreaSeparation'></div></div>
			{(!chatFriendState && <Users idMe={idMe} users={users} setUsers={setUsers} setChatFriendState={setChatFriendState} chatChannelState={chatChannelState} setChatChannelState={setChatChannelState}/>) 
			|| (<Chat setChatFriendState={setChatFriendState}/>)}
		</section>
	)
	//return null;
}

interface PropsHeader {
	idMe : number;
}

const Header : React.FC<PropsHeader> = (props) => {
	const idMe = props.idMe;

	const navigate = useNavigate()

	const onPlay = () => {
		navigate("")
	}
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	const onLogout = () => {
		axios.post(`http://localhost:8000/api/auth/logout`, {}, { withCredentials: true })
			.then(res => {
			})
		navigate("/")
	}

	return (
			<div className='boxNav'>
				<img src={mainTitle} className='titleNav' alt="mainTitle" />
				<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
				<div><button onClick={() => onProfil(idMe.toString())} className='ButtonStyle navButton'>Profil</button></div>
				<div><button onClick={() => onLogout()} className='ButtonStyle navButton'>Logout</button></div>
			</div >
		)
}

const MainPage = () => {
	const [idMe, setIdMe] = useState(0);
	const [getIDMe, setGetIDMe] = useState(false);

	useEffect(() => {
		axios.get(`http://localhost:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdMe(idME => id_tmp.id)
			})
		setGetIDMe(getIDMe => true)
	} , [getIDMe])

	return (
		<div id='bloc'>
			<Header idMe={idMe}/>
			<Body idMe={idMe}/>
		</div>
	);
};

export default MainPage;