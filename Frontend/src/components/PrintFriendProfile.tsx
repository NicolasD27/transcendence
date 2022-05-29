import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PrintUnfriendBlockProfile from './PrintUnfriendBlockProfile';
import PrintNormalFriendProfile from './PrintNormalFriendProfile';
import {FriendsFormat} from './ChatSectionUsers'
import {PropsStateUsers} from './ChatSectionUsers'

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

export default PrintFriendProfile;