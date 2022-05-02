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
	return (
		<div>
			<div className='friend'>
				<img src={friend1} className="friendAvatar" alt="FriendAvatar"/>
				<img src={props.status} className="friendStatutIcon" alt=" StatutIcon"/>
				<div id="username">{props.user.username}</div>
				<div id='friend_buttons'>
					{<UserButtons buttons={props.button} key={props.user.id}/>}
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
		for (let user in friends) {
			if (user[id] === id)
				return true
		}
		return false
	}

	const isThereAFriendshipRequest = (id: any) => {
		for (const user of friendRequestReceived) {
			if (user.id === id)
				return true
		}
		return false;
	}

	const acceptFriendshipRequest = (user:any) => {
		console.log('Button clicked Accept Friend')
		axios
			.post(dataUrlFriends, user)
			.then((res) => {
				setFriends(res.data)
				/*var index = friendRequestReceived.indexOf(res.data)
				setFriendRequestReceived(friendRequestReceived.splice(index, 1))
				console.log('friendsRequestReceived After:', friendRequestReceived)
				axios.delete('http://localhost:3001/friendRequestsReceived')
				.catch(err =>{
					console.log("Deletion error in friendRequestsReceived")
				})*/ 
				/* Supprimer la friend request quand la demande est accepté ou rejete (ajouter le boutton rejeté !!)*/
			})
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
							console.log('user id: ', user.id)
							return (
								<PrintUser user={user} status={status} button={[{ id : "chatButton", script: 'null' }, { id: "playButton", script: 'null' }]} key={user.id} />
							) 
						}
						else if (Boolean(isThereAFriendshipRequest(user.id)) === true)
						{
							return (
								<PrintUser user={user} status={status} button={[{ id : "AcceptFriendButton", script: () => acceptFriendshipRequest(user) }]} key={user.id} />
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
							<PrintUser user={user} status={status} button={[{ id : "chatButton", script: 'null' }, { id: "playButton", script: 'null' }]} key={user.id} />
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
			console.log('friendsRequestReceived:', friendRequestReceived)
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
	}, [])

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