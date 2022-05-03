import React from 'react';
import axios from 'axios';
import { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import mainTitle from "../asset/mainTitle.svg";
import searchIcon from "../asset/searchIcon.svg";
import statutIconGreen from "../asset/statutIconGreen.svg"
import statutIconRed from "../asset/statutIconRed.svg"
import friend1 from "../asset/friend1.svg"
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

const UserButtons = (props:any) => {
	return (
		<Fragment>
			{props.buttons.map((button:any) =>
				<button id={button.id} onClick={() => button.script()} key={button.id}/>
			)}
		</Fragment>
	)
}

//{user, status, button}:any
const PrintUser = (props:any) => {

	var value;

	props.button.map((button:any) => {
		button.id === 'InvitationSent' ? (value = <p id='InvitationSent'>Request Sent</p>) : (value = <UserButtons buttons={props.button} key={props.user.id}/>)
	})

	/*{
		value = <UserButtons buttons={props.button} key={props.user.id}/>
		console.log(props.id, "exist")
	}
	else(value = 'Invitation Sent')*/

	return (
		<div>
			<div className='friend'>
				<img src={friend1} className="friendAvatar" alt="FriendAvatar"/>
				<img src={props.status} className="friendStatutIcon" alt=" StatutIcon"/>
				<div id="username">{props.user.username}</div>
				<div id='friend_buttons'>
					{value}
				</div>
			</div>
		</div>
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
		/*for (const user in friendRequestsSent) {
			console.log('user[id]: ', user[id])
			if (user[id] === id)
				return true
		}*/
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
								<PrintUser user={user} status={status} button={[, { id: "playButton", script: () => 'null' }, { id : "chatButton", script: () => 'null' }]} key={user.id} />
							)
						}
						else if (Boolean(isThereAFriendshipRequest(user.id)) === true)
						{
							return (
								<PrintUser user={user} status={status} button={[{ id : "AcceptFriendButton", script: () => acceptFriendshipRequest(user) }, { id : "DeclinetFriendButton", script: () => declineFriendshipRequest(user) }]} key={user.id} />
							);
						}
						else if (Boolean(isThereAFriendshipRequestSent(user.id)) === true)
						{	
							return (
								<PrintUser user={user} status={status} button={[{ id : "InvitationSent", script: () => 'null' }]} key={user.id} />
							);
						}
						else
							return (
								<PrintUser user={user} status={status} button={[{ id : "AddFriendButton", script: () => sendFriendshipRequest(user) }]} key={user.id} />
							);
					})
				) ||
				(!searchValue && friends
					.map((user:any) => {
						let status = (user.status === "online" ? statutIconGreen : statutIconRed);
						return (
							<PrintUser user={user} status={status} button={[{ id : "chatButton", script: () => 'null' }, { id: "playButton", script: () => 'null' }]} key={user.id} />
						);
				}))
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