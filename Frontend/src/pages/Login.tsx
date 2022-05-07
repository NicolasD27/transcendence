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

const dataUrlFriends = "http://localhost:3001/friends"
const dataUrlFriendRequestsSent = "http://localhost:3001/friendRequestsSent"
const dataUrlFriendRequestsReceived = "http://localhost:3001/friendRequestsReceived"
const dataUrlUsers = "http://localhost:3001/users"

//import gameArea from '../asset/gameArea.svg';

const SearchBarAddGroup = ({setSearchValue}:any) => {

	const handleSearchRequest = (e: any) => {
		setSearchValue("")
		let value = e.target.value
		setSearchValue(value)
	}

	return (
		<div className="searchAndAdd">
			<div id="searchBar">
				<img src={searchIcon} alt="searchIcon" id='searchIcon'/>
				<input type='text' placeholder='Search...' name='searchFriend' id='searchFriend' onChange={handleSearchRequest} />
			</div>
			<button id='addGroup'></button>
		</div>
	)
}

const PrintNormalProfile = (props:any) => {

	return (
		<>
			<div id="username">{props.username}</div>
			<div id='friend_buttons'>
				<button id="friendPlayButton" onClick={() => ""}/>
				<button id="friendChatButton" onClick={() => ""}/>
				<button id="friendColumnButton" onClick={() => props.setFriendDeleteColumnState(true)}/>
			</div>
		</>
	)
}

const PrintDeleteProfile = (props:any) => {
	return (
		<>
			<button id='unfriend_button' onClick={() => props.deleteFriend(props.user)}>
					<p>Unfriend</p>
			</button>
			<button id="unfriendColumnButton" onClick={() => props.setFriendDeleteColumnState(false)}/> 	
		</>
	)
}

const PrintFriendProfile = (props:any) => {
	const [friendDeleteColumnState, setFriendDeleteColumnState] = useState(false)

	const deleteFriend = (user:any) => {
		console.log('delete Friend')
		axios
			.delete(`${dataUrlFriends}/${user.id}`)
			.catch((err) => 
				console.log(err))
	}

	return (
		<>
			<div className='user'>
					<div id='userAvatarIcon'>
						<img src={user1} className="userAvatar" alt="userAvatar"/>
						<img src={props.status} className="userStatutIcon" alt=" StatutIcon"/>
					</div>
				{!friendDeleteColumnState && <PrintNormalProfile username={props.username} setFriendDeleteColumnState={setFriendDeleteColumnState} />}
				{friendDeleteColumnState && <PrintDeleteProfile user={props.user} username={props.username} setFriendDeleteColumnState={setFriendDeleteColumnState} deleteFriend={deleteFriend}/>}
			</div>
		</>
	)
}

const PrintUserFriendRequestReceived = (props:any) => {
	return (
		<>
			<div className='user'>
				<div id='userAvatarIcon'>
					<img src={user1} className="userAvatar" alt="userAvatar"/>
					<img src={props.status} className="userStatutIcon" alt=" StatutIcon"/>
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
					<img src={props.status} className="userStatutIcon" alt=" StatutIcon"/>
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
				<div id='SendFriendRequest_buttons'>
					<button id="AddFriendButton" onClick={() => props.sendFriendshipRequest(props.user)}/>  
				</div>
			</div>
		</>
	)
}

const UserList = ({users, setUsers, friends, setFriends, friendRequestsSent, setFriendRequestsSent, friendRequestReceived, setFriendRequestReceived, searchValue, setSearchValue}:any) => {
	 
	const sendFriendshipRequest= (user: any) => {
		console.log('Button clicked sendFriendshipRequest')
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
		console.log('Button clicked Accept Friend Request')
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
		console.log('Button clicked Declined Friend Request')
		axios
			.delete(`${dataUrlFriendRequestsReceived}/${user.id}`)
			.catch((err) => 
				console.log(err)
			)
	}

	return (
			<div className='usersList'>
			{ 	 
				(searchValue !== "" && users
					.filter((user:any) => {
						return user.username.toLowerCase().includes(searchValue.toLowerCase())
					})
					.map((user:any) => {
						let status = (user.status === "online" ? statutIconGreen : statutIconRed);
							
						if (Boolean(isAlreadyFriend(user.id)) === true)
						{
							return (
								<PrintFriendProfile user={user} status={status} username={user.username} key={user.id} />
							)
						}
						else if (Boolean(isThereAFriendshipRequest(user.id)) === true)
						{
							return (
								<PrintUserFriendRequestReceived user={user} status={status} username={user.username} acceptFriendshipRequest={acceptFriendshipRequest} declineFriendshipRequest={declineFriendshipRequest} key={user.id}/>
							);
						}
						else if (Boolean(isThereAFriendshipRequestSent(user.id)) === true)
						{
							return (
								<PrintInvitationSentProfile user={user} status={status} username={user.username} key={user.id}/>
							);
						}
						else
							return (
								<PrintSendFriendRequestProfile user={user} status={status} username={user.username} sendFriendshipRequest={sendFriendshipRequest} key={user.id}/>
							);
					})
				) ||
				(!searchValue && friends
					.map((user:any) => {
						let status = (user.status === "online" ? statutIconGreen : statutIconRed);
							return (
								<PrintFriendProfile user={user} status={status} username={user.username} key={user.id} />
							);
					})
				)
			}
		</div>
	)
}

const Chat = () => {
	const [ users, setUsers ] = useState([]);
	const [ friends, setFriends ] = useState([]);
	const [ friendRequestsSent, setFriendRequestsSent ] = useState([]);
	const [ friendRequestReceived, setFriendRequestReceived ] = useState([]);
	const [ searchValue, setSearchValue ] = useState("");

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
		.get(dataUrlUsers)
		.then (res => {
			const user = res.data;
			setUsers(user)
		})
		.catch (err => 
			console.log(err)
		)
	}, [])

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
			<SearchBarAddGroup setSearchValue={setSearchValue}/>
			<UserList 
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
			/>
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
	return (
		<section id="gameAndChatSection">
			<div className='gameArea'><div className='gameAreaSeparation'></div></div>
			<Chat/>
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