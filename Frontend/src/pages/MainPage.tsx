import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import mainTitle from '../asset/Pong-Legacy.svg';
import searchIcon from '../asset/searchIcon.svg';
import addGroupIcon from "../asset/addGroupIcon.svg"
import { cp } from 'fs/promises';
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import user1 from "../asset/friend1.svg"
import playIcon from "../asset/PlayIcon_blue.svg"
import Avatar from '../components/Avatar';
import CloseChatWindow from '../asset/CloseChatWindow.svg'
import { Channel, channel } from 'diagnostics_channel';
import { collapseTextChangeRangesAcrossMultipleVersions, createEmitAndSemanticDiagnosticsBuilderProgram, isPropertySignature } from 'typescript';
import { join } from 'path';
import Match from '../components/Match';
import NotificationList from '../components/NotificationList';
import { Socket } from 'socket.io';
import './MainPage.css'

const dataUrlChannelsJoined = `http://${process.env.REACT_APP_HOST || `localhost`}:8000/api/channels/`
const dataUrlExistingChannel = `http://${process.env.REACT_APP_HOST || `localhost`}:8000/api/channels`
const dataUrlFriends = `http://${process.env.REACT_APP_HOST || `localhost`}:8000/api/friendships/`

//////////////////////////////
//const dataUrlFriendRequestsSent = `http://${process.env.REACT_APP_HOST || `localhost`}:3001/friendRequestsSent`
//const dataUrlFriendRequestsReceived = `http://${process.env.REACT_APP_HOST || `localhost`}:3001/friendRequestsReceived`
//////////////////////////////


const dataUrlUsers = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users`
//import gameArea from '../asset/gameArea.svg';

interface PropsPrintFriendToAddChannel {
	friends : FriendsFormat[];
	selectedFriend : FriendsFormat[];
	setSelectedFriend : Dispatch<SetStateAction<FriendsFormat[]>>;
}

const PrintFriendToAddChannel : React.FC<PropsPrintFriendToAddChannel> = (props) => {

	const [ profileAvatar, setProfileAvatar ] = useState("")
	const defaultAvatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	const navigate = useNavigate()

	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	const checkSelectionStatus = (user:any) => {
		if (props.selectedFriend.filter((friend:any) => friend.id === user.id).length === 0) {
			var newArrayAdding = [...props.selectedFriend, user]
			props.setSelectedFriend(newArrayAdding)
		}
		else {
			var newArrayDeletion = props.selectedFriend.filter((friend:any) => friend.id !== user.id)
			props.setSelectedFriend(newArrayDeletion)
		}
	}

	return (
		<>
			{props.friends
				.map((user:FriendsFormat) => {
					let statusIcon = (user.status === 1 ? statusIconGreen : statusIconRed)

					if (user.avatarId != null)
					{
						console.log("catching avatar !!")
						setProfileAvatar(`http://localhost:8000/api/database-files/${user.avatarId}`)
					}

					return (
						<div className='user' key={user.id}>
							<div id='userAvatarIcon'>
								{
									user.avatarId == null && 
									<img src={defaultAvatar} className="userAvatar" alt="defaultAvatar" onClick={() => onProfil(user.id.toString())}/>
								}
								{
									user.avatarId != null &&
									<img src={profileAvatar} className="userAvatar" alt="profileAvatar" onClick={() => onProfil(user.id.toString())}/> 
								}
								<img src={statusIcon} className="userStatusIcon" alt="StatusIcon"/>
							</div>
							<div id="username">{user.username}</div>
							<div className='checkbox_Channel'>
								<input type='checkbox' name="addFriendToChannelButton" id={user.id.toString()} onChange={() => checkSelectionStatus(user)}/>
								<label htmlFor={user.id.toString()}></label>
							</div>
						</div>
					)
				})
			}
		</>
	)
}

interface propsPrintChannelCreationSettings {
	setIsNextButtonClicked : Dispatch<SetStateAction<boolean>>;
	setChannelVisibilitySelected : Dispatch<SetStateAction<string>>;
	setChannelNameEntered : Dispatch<SetStateAction<string>>;
	setPasswordEntered : Dispatch<SetStateAction<string>>;
}

const PrintChannelCreationSettings : React.FC<propsPrintChannelCreationSettings> = (props) => {
	const [ isProtectedCLicked, setIsProtectedClicked ] = useState(false)

	const handlePasswordEntered = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		props.setPasswordEntered(e.target.value)
	}

	const handleChannelNameEntered = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		props.setChannelNameEntered(e.target.value)
	}

	return (
		<>
			<div className='enterChannelName'>
				<label>Channel Name
					<input type="text" placeholder="My Channel Name" name="channelName" onChange={handleChannelNameEntered} required/>
				</label>
			</div>
			<div className='checkbox_ChannelSettings'>
				<div>
					<label htmlFor='isPublicChannel'>Public</label>
					<input type='radio' name="modeChannel" id="isPublicChannel" onChange={() => {props.setChannelVisibilitySelected("public"); setIsProtectedClicked(false)}}/>
				</div>
				<div>
					<label htmlFor="isProtectedChannel"><br/>Protected</label>
					<input type='radio' name="modeChannel" id="isProtectedChannel" onChange={() => { props.setChannelVisibilitySelected("protected"); setIsProtectedClicked(true)}}/>
					{
						isProtectedCLicked && 
						<input type="password" name="password" placeholder='Password' id='createChannelPasswordInput' onChange={handlePasswordEntered} required/>
					}
				</div>
				<div>
					<label htmlFor='isPrivateChannel'><br/>Private</label>
					<input type='radio' name="modeChannel" id="isPrivateChannel" onChange={() => {props.setChannelVisibilitySelected("private"); setIsProtectedClicked(false)}}/>
				</div>
			</div>
		</>
	)
}



interface PropsSearchBarAddGroup {
	setSearchValue : Dispatch<SetStateAction<string>>
	friends: FriendsFormat[];
	createChannelButtonState : boolean;
	setCreateChannelButtonState : Dispatch<SetStateAction<boolean>>;
}

const SearchBarAddGroup : React.FC<PropsSearchBarAddGroup> = (props) => {

	const [ selectedFriend, setSelectedFriend ] = useState<FriendsFormat[]>([])
	const [ isNextButtonClicked , setIsNextButtonClicked ] = useState(false)
	const [ channelVisibilitySelected , setChannelVisibilitySelected ] = useState("public")
	const [ channelNameEntered , setChannelNameEntered ] = useState("")
	const [ passwordEntered , setPasswordEntered ] = useState("")
	const [ isPrivate, setIsPrivate ] = useState(false)
	const [ isProtected, setIsProtected ] = useState(false)


	const handleSearchRequest = (e:any) => {
		props.setSearchValue("")
		let value = e.target.value
		props.setSearchValue(value)
	}

	const handleClick = () => {
		props.setCreateChannelButtonState(!props.createChannelButtonState)
	}

	const createChannel = (/*channelName : () => void*/) => {
		if (channelVisibilitySelected === "private")
			setIsPrivate(true)
		else if (channelVisibilitySelected === "protected")
			setIsProtected(true)

		/*if (passwordEntered.length < 1 || passwordEntered.length >= 32)
			{

			}*/
		
		console.log("password entered:", passwordEntered)
		axios
			.post(`http://localhost:8000/api/channels`, {
				"name": channelNameEntered,
				"isPrivate": isPrivate,
				"isProtected": isProtected,
				"password": passwordEntered
			  }, { withCredentials: true })
			.then((response) => {
				/*if (response.data.message === "This channel name is already taken.") 
				{
					channelName.classList.add('error');
					setTimeout(function () {
						channelName.classList.remove('error');
					}, 300);
				}*/
			})
			.catch((err) => console.log(err.data)
			)

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
					{
						isNextButtonClicked && 
						<>
							<div className='channelCreationSettings'>
								<PrintChannelCreationSettings setIsNextButtonClicked={setIsNextButtonClicked} setChannelVisibilitySelected={setChannelVisibilitySelected} setChannelNameEntered={setChannelNameEntered} setPasswordEntered={setPasswordEntered}/> 
							</div>
							<button id="checkbox_previousChannelButton" type="button" onClick={() => setIsNextButtonClicked(!isNextButtonClicked)}>Previous</button>
							<button id="checkbox_createChannelButton" formMethod='post' type="button" onClick={createChannel}>Create Channel</button>
						</>
						||
						<>
							<div className='usersList'>
								<PrintFriendToAddChannel friends={props.friends} selectedFriend={selectedFriend} setSelectedFriend={setSelectedFriend}/>
							</div>
							<button id="checkbox_nextChannelButton" type="button" onClick={() => setIsNextButtonClicked(!isNextButtonClicked)}>Next</button>
						</>
					}
				</>
			}

		</>
	)
	/*<div className='usersList'>
	{
		isNextButtonClicked && 
		<>
			<PrintChannelCreationSettings setIsNextButtonClicked={setIsNextButtonClicked}/> 
		</>
		||
		<>
			<PrintFriendToAddChannel friends={props.friends} selectedFriend={selectedFriend} setSelectedFriend={setSelectedFriend}/>
		</>
	}
	</div>
	{
		isNextButtonClicked &&
		<button id="checkbox_createChannelButton" formMethod='post' type="button" onClick={createChannel}>Create Channel</button>
		||
		<button id="checkbox_createChannelButton" type="button" onClick={() => setIsNextButtonClicked(true)}>Next</button>
	}*/
			/*{console.log("isNextButtonClicked: ", isNextButtonClicked)}
			{
				isNextButtonClicked && 
				<>
					<div className='userList'>
					</div>
					<button id="checkbox_createChannelButton" formMethod='post' type="button" onClick={createChannel}>Create Channel</button>
				</>
			}*/
	//<input type="button" id="createChannelButton" value="Create Channel" onClick={handleClick1}/>
}

interface PropsPrintNormalFriendProfile {
	user : PropsStateUsers;
	setFriendDeleteColumnState : Dispatch<SetStateAction<boolean>>;
	setChatFriendState :  Dispatch<SetStateAction<boolean>>;
	isBlocked : boolean;
	setIsBlocked : Dispatch<SetStateAction<boolean>>;
}

const PrintNormalFriendProfile : React.FC<PropsPrintNormalFriendProfile> = (props) => {
	
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

interface PropsPrintUnfriendBlockProfile {
	user:  PropsStateUsers;
	setFriendDeleteColumnState : Dispatch<SetStateAction<boolean>>;
	deleteFriend : Function;
	isBlocked : boolean;
	setIsBlocked : Dispatch<SetStateAction<boolean>>;
}

const PrintUnfriendBlockProfile : React.FC<PropsPrintUnfriendBlockProfile> = (props) => {
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
						(<button id='unblock_buttons' onClick={() => props.setIsBlocked(false)}>
							Unblock
						</button>)
				}
			</div>
			<button id="unfriendColumnButton" onClick={() => props.setFriendDeleteColumnState(false)}/>
		</>
	)
}

interface PropsPrintFriendProfile {
	friends: FriendsFormat[];
	user:  PropsStateUsers;
	statusIcon: string;
	key: number;
	setChatFriendState : Dispatch<SetStateAction<boolean>>;
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
		if (props.user.avatarId != null)
		{
			console.log("catching avatar !!")
			setProfileAvatar(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${props.user.avatarId}`)
		}
	}, [])


	const deleteFriend = (user : PropsStateUsers) => {
		for (let i = 0; i < props.friends.length; i++)
		{
			if (props.friends[i].id === props.user.id)
			{
				axios
					.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.friends[i].friendshipId}`, { withCredentials: true })
					.then(() => {
						const newFriendsList = props.friends.filter((friend) => friend.id != props.user.id)
						props.setFriends(newFriendsList)
					})
					.catch((err) =>
						console.log(err))
			}
		}
	}

	return (
		<div className='user'>
				<div id='userAvatarIcon'>
					<img src={props.user.avatarId ? profileAvatar : defaultAvatar} className="userAvatar" alt="Avatar" onClick={() => onProfil(props.user.id.toString())}/>
					<img src={props.statusIcon} className="userStatusIcon" alt="StatusIcon"/>
				</div>
			{!friendDeleteColumnState && <PrintNormalFriendProfile user={props.user} setFriendDeleteColumnState={setFriendDeleteColumnState} setChatFriendState={props.setChatFriendState} isBlocked={isBlocked} setIsBlocked={setIsBlocked}/>}
			{friendDeleteColumnState && <PrintUnfriendBlockProfile user={props.user} setFriendDeleteColumnState={setFriendDeleteColumnState} deleteFriend={deleteFriend} isBlocked={isBlocked} setIsBlocked={setIsBlocked}/>}
		</div>
	)
}

interface PropsPrintUserFriendRequestReceived {
	user :  PropsStateUsers;
	statusIcon : string;
	acceptFriendshipRequest : Function;
	declineFriendshipRequest: Function;
	key : number;
}

const PrintUserFriendRequestReceived : React.FC<PropsPrintUserFriendRequestReceived> = (props) => {
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
	)
}

interface PropsPrintInvitationSentProfile {
	user : PropsStateUsers;
	statusIcon : string;
	key : number;
}

const PrintInvitationSentProfile : React.FC<PropsPrintInvitationSentProfile> = (props) => {
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

interface PropsPrintSendFriendRequestProfile {
	user:  PropsStateUsers;
	statusIcon: string;
	//sendFriendshipRequest : Function;
	key: number;
}

const PrintSendFriendRequestProfile : React.FC<PropsPrintSendFriendRequestProfile> = (props) => {
	const [ profileAvatar, setProfileAvatar ] = useState("")

	const defaultAvatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';

	const navigate = useNavigate()

	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	useEffect(() => {
		if (props.user.avatarId != null)
			setProfileAvatar(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${props.user.avatarId}`)
	}, [])

	return (
		<>
			<div className='user'>
				<div className='flex-v-centered'>
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
				</div>
				<button id="SendFriendRequest_buttons" onClick={() => console.log("SendFriendRequest_buttons clicked")/*props.sendFriendshipRequest(props.user)*/}/>
			</div>
		</>
	)
}

interface PropsPrintChannelsJoined {
	channel : PropsStateChannel;
	chatChannelState : boolean;
	setChatChannelState : Dispatch<SetStateAction<boolean>>;
}

const PrintChannelsJoined : React.FC<PropsPrintChannelsJoined> = (props) => {
	const [ isMute, setIsMute ]= useState(false)
	return (
		<div className='channel'>
			<div id='channelAvatarIcon'></div>
			<div id="channelName">{props.channel.name}</div>
			<div id="channel_buttons">
				{
					!isMute && <button id="muteChannel" onClick={() => setIsMute(true)}/> ||
					<button id="unmuteChannel" onClick={() => setIsMute(false)}/>
				}
				<button id="channelChat_button" onClick={() => props.setChatChannelState(!props.chatChannelState)}/>
			</div>
		</div>
	)
}

interface PropsPrintChannelsToJoin {
	channel : PropsStateChannel;
	joinedChannels : PropsStateChannel[];
	setJoiningChannel : Dispatch<SetStateAction<boolean>>;
}

const PrintChannelsToJoin : React.FC<PropsPrintChannelsToJoin> = (props) => {
	const [ isButtonClicked, setIsButtonClicked ] = useState(false)
	const [ enteredPassword, setEnteredPassword ] = useState("")

	const handleEnteredPassword = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		setEnteredPassword(e.target.value);
	}

	const sendPassword = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		console.log("enteredPassword", enteredPassword)
		axios
			.post(`http://localhost:8000/api/channels/${props.channel.id}/join`, {"password" : enteredPassword}, { withCredentials: true })
			.then(() => props.setJoiningChannel(true))
			.catch((error) => console.log(error.data))
	}

	const handleClick = () => {
		setIsButtonClicked(true)
		if (props.channel.isProtected === false)
			sendPassword("")
	}

	return (
		<div className='channel'>
			<div id='channelAvatarIcon'></div>
			{
				(
					!isButtonClicked &&
						<>
							<div id="channelName">{props.channel.name}</div>
							<button id="channelSendRequest_buttons" onClick={handleClick}/>
						</>
				) ||
				(
					props.channel.isProtected === true && 
						<div id="channelPassword">
							<input type="password" placeholder="Password" onChange={handleEnteredPassword} required/>
							<button id="confirmPassword" onClick={sendPassword}/>
						</div>				 
				)
			}
		</div>
	)
}

interface  PropsUserList {
	idMe : number;
	existingChannels: PropsStateChannel[];
	joinedChannels : PropsStateChannel[]
	setJoiningChannel: Dispatch<SetStateAction<boolean>>;
	searchUsers : PropsStateUsers[];
	friends: FriendsFormat[];
	setFriends : Dispatch<SetStateAction<FriendsFormat[]>>;
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
		for (const user of friendRequestReceived) {
			if (user.id === id)
				return true
		}
		return false
	}

	const isThereAFriendshipRequestSent = (id:number) => {
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
						/*else if (Boolean(isThereAFriendshipRequest(user.id)) === true)
						{
							return (
								null
								//<PrintUserFriendRequestReceived user={user} statusIcon={status} acceptFriendshipRequest={acceptFriendshipRequest} declineFriendshipRequest={declineFriendshipRequest} key={user.id}/>
							)
						}
						else if (Boolean(isThereAFriendshipRequestSent(user.id)) === true)
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

interface PropsUsers {
	socket : any;
	idMe : number;
	//users : PropsStateUsers[];
	//setUsers : Dispatch<SetStateAction<PropsStateUsers[]>>;
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
	friendshipId : number;
	id : number;
	username : string;
	pseudo : string;
	avatarId : string;
	status : number;
}

interface PropsStateChannel {
	id : number;
	isProtected : boolean;
	name : string;
	description : string;
}

const Users : React.FC<PropsUsers> = (props) => {
	const [ searchUsers, setSearchUsers ] = useState<PropsStateUsers[]>([])
	const [ friends, setFriends ] = useState<FriendsFormat[]>([])
	const [ joinedChannels, setJoinedChannels ] = useState<PropsStateChannel[]>([])
	const [ joiningChannel, setJoiningChannel ] = useState(false)
	const [ existingChannels, setExistingChannels ] = useState<PropsStateChannel[]>([])
	const [ friendsState, setFriendsState ] = useState(false)

	const [ friendRequestsSent, setFriendRequestsSent ] = useState([])
	const [ friendRequestReceived, setFriendRequestReceived ] = useState([])
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

interface PropsChat {
	setChatFriendState : Dispatch<SetStateAction<boolean>>;
}

const Chat : React.FC<PropsChat> = (props) => {
	const username = "Leslie Alexander"
	//const friendName = username.replace(/ /g, "\n");

	return (
		<div className='chatArea'>
			<div id='chatTop'>
				<button id='chatCloseButton' onClick={() => props.setChatFriendState(false)}/>
				<div id='friendChatAvatarIcon'>
					<img src={user1} className="friendchatAvatar" alt="friendAvatar"/>
					<img src={statusIconGreen} className="friendchaStatusIcon" alt="friendchaStatusIcon"/>
				</div>
				<div id="chatUsername">{username}</div>
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
	socket: any
}

const Body : React.FC<PropsBody> = (props) => {

	const idMe = props.idMe;
	const [ users, setUsers ] = useState<PropsStateUsers[]>([])
	const [ chatFriendState, setChatFriendState ] = useState(false)
	const [ chatChannelState, setChatChannelState ] = useState(false)

	const  [ userstate, setUserState ] = useState(false);

	/*useEffect(() => {
		setUsers([])
		axios
			.get(dataUrlUsers , { withCredentials : true })
			.then (res => {
				const user = res.data;
				setUsers(user)
			})
			.catch (err =>
				console.log(err)
			)
	}, [])*/
 
	return (
		<section id="gameAndChatSection">
			<div className='gameArea' id='gameArea'></div>
			<Match socket={props.socket}/>
			{(!chatFriendState && <Users socket={props.socket} idMe={idMe} /*users={users} setUsers={setUsers}*/ setChatFriendState={setChatFriendState} chatChannelState={chatChannelState} setChatChannelState={setChatChannelState}/>)
			|| (<Chat setChatFriendState={setChatFriendState}/>)}
		</section>
	)
}

interface PropsHeader {
	idMe : number;
	socket: any
}

const Header : React.FC<PropsHeader> = (props) => {
	const idMe = props.idMe;

	const navigate = useNavigate()

	const onPlay = () => {
		props.socket.emit('find_match')
		navigate("/mainpage")

	}
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	const onLogout = () => {
		axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/auth/logout`, {}, { withCredentials: true })
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

const MainPage = ({socket}: {socket: any}) => {
	const [idMe, setIdMe] = useState(0);
	const [getIDMe, setGetIDMe] = useState(false);

	useEffect(() => {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdMe(id_tmp.id)
			})
		setGetIDMe(getIDMe => true)
	} , [])

	return (
		<div id='bloc'>
			<Header idMe={idMe} socket={socket}/>
			<Body idMe={idMe} socket={socket}/>
			{getIDMe && <NotificationList myId={idMe} socket={socket}/>}
		</div>
	);
};

export default MainPage;