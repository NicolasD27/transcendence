import React from 'react';
import axios from 'axios';
import { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import mainTitle from "../asset/mainTitle.svg";
import searchIcon from "../asset/searchIcon.svg";
import statutIconGreen from "../asset/statutIconGreen.svg"
import statutIconRed from "../asset/statutIconRed.svg"
import user1 from "../asset/friend1.svg"
import playIcon from "../asset/PlayIcon_blue.svg"
import Avatar from '../components/Avatar';
import CloseChatWindow from '../asset/CloseChatWindow.svg'
import { channel } from 'diagnostics_channel';
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

const dataUrlChannel = "http://localhost:3001/channels"
const dataUrlFriends = "http://localhost:3001/friends"
const dataUrlFriendRequestsSent = "http://localhost:3001/friendRequestsSent"
const dataUrlFriendRequestsReceived = "http://localhost:3001/friendRequestsReceived"
const dataUrlUsers = "http://localhost:3001/users"

//import gameArea from '../asset/gameArea.svg';

const PrintFriendToAddChannel = (props:any) => {

	const checkSelectionStatus = (user:any) => {

		if (props.selectedFriend.filter((friend:any) => friend.id === user.id).length === 0){
			var newarrayadding = [...props.selectedFriend, user]
			props.setSelectedFriend(newarrayadding)
		}
		else{
			var newarraydeletion = props.selectedFriend.filter((friend:any) => friend.id !== user.id)
			props.setSelectedFriend(newarraydeletion)
		}
	}

	return (
		props.friends
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
			})
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

	useEffect(() => {
		console.log('selectedFriend: ' , selectedFriend)
	}, [selectedFriend])

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

const PrintNormalProfile = (props:any) => {
	return (
		<>
			<div id="username">{props.username}</div>
					<div id='friend_buttons'>
						{(!props.isBlocked &&
							<>
								<button id="friendPlay_button" onClick={() => ""}/>
								<button id="friendChat_button" onClick={() => props.setChatState(true)}/> 
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

const PrintFriendProfile = (props:any) => {

	const [ friendDeleteColumnState, setFriendDeleteColumnState ] = useState(false)
	const [ isBlocked, setIsBlocked ]= useState(false)

	const deleteFriend = (user:any) => {
		axios
			.delete(`${dataUrlFriends}/${user.id}`)
			.catch((err) => 
				console.log(err))
	}

	useEffect(() => {
		props.setSelectedUser(props.user)
	}, [props.user])

	return (
		<div className='user'>
				<div id='userAvatarIcon'>
					<img src={user1} className="userAvatar" alt="userAvatar"/>
					<img src={props.status} className="userStatutIcon" alt="StatutIcon"/>
				</div>
			{!friendDeleteColumnState && <PrintNormalProfile user={props.user} username={props.username} setFriendDeleteColumnState={setFriendDeleteColumnState} setChatState={props.setChatState} setSelectedUser={props.setSelectedUser} isBlocked={isBlocked} setIsBlocked={setIsBlocked}/>}
			{friendDeleteColumnState && <PrintUnfriendBlockProfile user={props.user} username={props.username} setFriendDeleteColumnState={setFriendDeleteColumnState} deleteFriend={deleteFriend} isBlocked={isBlocked} setIsBlocked={setIsBlocked}/>}
		</div>
	)
}

const PrintUserFriendRequestReceived = (props:any) => {
	return (
		<>
			<div className='user'>
				<div id='userAvatarIcon'>
					<img src={user1} className="userAvatar" alt="userAvatar"/>
					<img src={props.status} className="userStatutIcon" alt="StatutIcon"/>
				</div>
				<div id="username">{props.username}</div>
				<div id='friendRequest_buttons'>
					<button id="AcceptFriendButton" onClick={() => props.acceptFriendshipRequest(props.user)} /> 
					<button id="DeclineFriendButton" onClick={() => props.declineFriendshipRequest(props.user)} /> 
				</div>
			</div>
		</>
	)
}

const PrintInvitationSentProfile = (props:any) => {
	return (
		<>
			<div className='user'>
				<div id='userAvatarIcon'>
					<img src={user1} className="userAvatar" alt="userAvatar"/>
					<img src={props.status} className="userStatutIcon" alt="StatutIcon"/>
				</div>
				<div id="username">{props.username}</div>
				<div id='invitation_sent'>
					Invitation Sent
				</div>
			</div>
		</>
	)
}

const PrintSendFriendRequestProfile = (props:any) => {
	return (
		<>
			<div className='user'>
				<div id='userAvatarIcon'>
					<img src={user1} className="userAvatar" alt="userAvatar"/>
					<img src={props.status} className="userStatutIcon" alt=" StatutIcon"/>
				</div>
				<div id="username">{props.username}</div>
				<button id="SendFriendRequest_buttons" onClick={() => props.sendFriendshipRequest(props.user)}/>  
			</div>
		</>
	)
}

const PrintChannel = (props:any) => {
	const [ isMute, setIsMute ]= useState(false)

	return (
		<div className='channel'>
			<div id='channelAvatarIcon'></div>
			<div id="channelName">{props.channelName}</div>
			{
				(!isMute && <button id="muteChannel" onClick={() => setIsMute(true)}/>) ||
				<button id="unmuteChannel" onClick={() => setIsMute(false)}/>
			}
		</div>
	)
}

const UserList = ({channel, setChannel, users, setUsers, friends, setFriends, friendRequestsSent, setFriendRequestsSent, friendRequestReceived, setFriendRequestReceived, searchValue, setSearchValue, setChatState, setSelectedUser}:any) => {

	const sendFriendshipRequest= (user: any) => {
		axios
			.post(dataUrlFriendRequestsSent, user)
			.then((response) => {
				setFriendRequestsSent(response.data)
			})
	}

	const isAlreadyFriend = (id: any) => {
		for(var i = 0; i < friends.length; i++ )
		{
			if (friends[i].id === id)
				return true
		}
		return false;
	}

	const isThereAFriendshipRequest = (id: any) => {
		for (const user of friendRequestReceived) {
			if (user.id === id)
				return true
		}
		return false;
	}

	const isThereAFriendshipRequestSent = (id: any) => {
		for (var i = 0; i < friendRequestsSent.length; i++)
		{
			if (friendRequestsSent[i].id === id)
				return true
		}
		return false;
	}

	const acceptFriendshipRequest = (user:any) => {
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
	}

	return (
			<div className='usersList'>
			{
				searchValue !== ""
				&& channel
					.filter((channel:any) => {
						return channel.name.toLowerCase().includes(searchValue.toLowerCase())
					})
					.map((channel:any) => {
						console.log('channel.name: ', channel.name)
						return (
							<PrintChannel channelName={channel.name} key={channel.id}/>
						)}
					)
			}
			{
				searchValue !== ""
				&& users
					.filter((user:any) => {
						return user.username.toLowerCase().includes(searchValue.toLowerCase())
					})
					.map((user:any) => {
						let status = (user.status === "online" ? statutIconGreen : statutIconRed);
						if (Boolean(isAlreadyFriend(user.id)) === true)
						{
							return (
								<PrintFriendProfile user={user} status={status} username={user.username} key={user.id} setChatState={setChatState} setSelectedUser={setSelectedUser}/>
							)
						}
						else if (Boolean(isThereAFriendshipRequest(user.id)) === true)
						{
							return (
								<PrintUserFriendRequestReceived user={user} status={status} username={user.username} acceptFriendshipRequest={acceptFriendshipRequest} declineFriendshipRequest={declineFriendshipRequest} key={user.id}/>
							)
						}
						else if (Boolean(isThereAFriendshipRequestSent(user.id)) === true)
						{
							return (
								<PrintInvitationSentProfile user={user} status={status} username={user.username} key={user.id}/>
							)
						}
						else
							return (
								<PrintSendFriendRequestProfile user={user} status={status} username={user.username} sendFriendshipRequest={sendFriendshipRequest} key={user.id}/>
							)
					})
				||
				(!searchValue && friends
					.map((user:any) => {
						let status = (user.status === "online" ? statutIconGreen : statutIconRed);
						return (
							<PrintFriendProfile user={user} status={status} username={user.username} key={user.id} setChatState={setChatState} setSelectedUser={setSelectedUser}/>
						);
					})
				)
			}
		</div>
	)
}

const Users = ({users, setUsers, setChatState, setSelectedUser}:any) => {
	const [ channel, setChannels ] = useState([])
	const [ friends, setFriends ] = useState([])
	const [ friendRequestsSent, setFriendRequestsSent ] = useState([])
	const [ friendRequestReceived, setFriendRequestReceived ] = useState([])
	const [ searchValue, setSearchValue ] = useState("")
	const [ createChannelButtonState, setCreateChannelButtonState ] = useState(false)

	useEffect(() => {
		axios
		.get(dataUrlChannel)
		.then (res => {
			let channel = res.data;
			setChannels(channel)
		})
		.catch (err =>
			console.log(err)
		)
	}, [channel])

	useEffect(() => {
		axios 
		.get(dataUrlFriends)
		.then (res => {
			let friend = res.data;
			setFriends(friend)
		})
		.catch (err => 
			console.log(err)
		)
	}, [friends])

	useEffect(() => {
		axios 
		.get(dataUrlFriendRequestsReceived)
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
		.get(dataUrlFriendRequestsSent)
		.then (res => {
			const request = res.data;
			setFriendRequestsSent(request)
		})
		.catch (err => { 
			console.log(err)
		})
	}, [friendRequestsSent])


	return (
		<div className='chatArea'>
			<SearchBarAddGroup setSearchValue={setSearchValue} friends={friends} createChannelButtonState={createChannelButtonState} setCreateChannelButtonState={setCreateChannelButtonState}/>
			{
				!createChannelButtonState && 
				<UserList 
					channel={channel}
					setChannels={setChannels}
					users={users}
					setUsers={setUsers}
					friends={friends}
					setFriends={setFriends}
					friendRequestsSent={friendRequestsSent}
					setFriendRequestsSent={setFriendRequestsSent}
					friendRequestReceived={friendRequestReceived}
					setFriendRequestReceived={setFriendRequestReceived}
					searchValue={searchValue}
					setSearchValue={setSearchValue}
					setChatState={setChatState}
					setSelectedUser={setSelectedUser}
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
				<button id='chatColumnButton' onClick={() => props.setChatState(false)}/>
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

const Header = () => {
	const navigate = useNavigate()

	const onPlay = () => {
		navigate("")
	}

	const onProfil = () => {
		navigate("/profil")
	}

	return (
		<div className='boxNav'>
			<img src={mainTitle} className='titleNav' alt="mainTitle"/>
			<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
			<div><button onClick={() => onProfil()} className='ButtonStyle navButton'>Profil</button></div>
		</div >)
}

const Body = () => {

	const [ users, setUsers ] = useState([])
	const [ selectedUser, setSelectedUser ] = useState(users)
	const [ chatState, setChatState ] = useState(false) 

	useEffect(() => {
		axios
		.get(dataUrlUsers)
		.then (res => {
			const user = res.data;
			setUsers(user)
		})
		.catch (err => 
			console.log(err)
		)
	}, [])

	return (
		<section id="gameAndChatSection">
			<div className='gameArea'><div className='gameAreaSeparation'></div></div>
			{(!chatState && <Users users={users} setUsers={setUsers} setChatState={setChatState} setSelectedUser={setSelectedUser}/>) 
			|| (<Chat setChatState={setChatState}/>)}
		</section>
	)
}

const Login = () => {
	return (
		<Fragment>
			<div id='bloc'>
				<Header/>
				<Body/>
			</div>
		</Fragment>
	);
};

export default Login;