import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PropsStateUsers } from './ChatSectionUsers'
import { chatStateFormat } from '../App';
import PrintNormalFriendProfile from './PrintNormalFriendProfile';
import PrintUnfriendBlockProfile from './PrintUnfriendBlockProfile';
import './PrintFriend.css'

export enum FriendshipStatus {
	PENDING,
	ACTIVE,
	BLOCKED_BY_FOLLOWER,
	BLOCKED_BY_FOLLOWING
}

interface PropsPrintFriend {
	idMe: number;
	socket: any;
	ImPlaying : boolean;
	user: PropsStateUsers;
	friendshipId: number;
	friendshipStatus : number;
	statusIcon: string;
	isFriend: boolean;
	pendingRequest: boolean;
	sendFriendshipRequest: Function;
	blockedByFriend: boolean;
	isUserBlocked: boolean;
	setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState: chatStateFormat;
	setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>;
	matchId: number;
	goToMatch: Function;
	setUsersBlocked : Dispatch<SetStateAction<number[]>>;
	key: number;
}



const PrintFriend: React.FC<PropsPrintFriend> = (props) => {
	const [profileAvatar, setProfileAvatar] = useState("")
	const [friendDeleteColumnState, setFriendDeleteColumnState] = useState(false)
	//const [isBlocked, setIsBlocked] = useState(false)
	const navigate = useNavigate()

	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
		//window.location.reload()
	}

	const defaultAvatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';

	useEffect(() => {
		if (props.user.avatarId != null)
			setProfileAvatar(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${props.user.avatarId}`)
	}, [props.user.avatarId])

	const deleteFriend = () => {
		axios
			.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.friendshipId}`, { withCredentials: true })
			.then(() => {
				props.setIsFriendshipButtonClicked(true)
				axios
					.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/blocked`, { withCredentials: true })
					.then(res => {
						props.setUsersBlocked(res.data)
					})
					.catch(err => console.log("Error:", err))
				props.socket.emit("askForRefreshFriend")
			})
			.catch((err) =>
				console.log(err))
	}

	return (
		<div className='user'>
			<div className='flex-v-centered'>
				<div id='userAvatarIcon'>
					<img src={props.user.avatarId ? profileAvatar : defaultAvatar} className="userAvatar" alt="Avatar" onClick={() => onProfil(props.user.id.toString())} />
					<img src={props.statusIcon} className="userStatusIcon" alt="StatutIcon" />
				</div>
				{!friendDeleteColumnState && <div id="username">{props.user.pseudo}</div>}
			</div>
			{
				(props.isFriend &&
					!friendDeleteColumnState && <PrintNormalFriendProfile socket={props.socket} ImPlaying={props.ImPlaying} user={props.user} friendshipId={props.friendshipId} setFriendDeleteColumnState={setFriendDeleteColumnState} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} isUserBlocked={props.isUserBlocked} matchId={props.matchId} goToMatch={props.goToMatch} blockedByFriend={props.blockedByFriend} />)
				||
				(props.isFriend &&
					friendDeleteColumnState && <PrintUnfriendBlockProfile socket={props.socket} user={props.user} friendshipId={props.friendshipId} friendshipStatus={props.friendshipStatus} setFriendDeleteColumnState={setFriendDeleteColumnState} deleteFriend={deleteFriend} isUserBlocked={props.isUserBlocked} /*setIsBlocked={setIsBlocked}*/ blockedByFriend={props.blockedByFriend} />)
				||
				(props.pendingRequest &&

					<div id='friendRequest_buttons'>
						Pending ...
					</div>
				)
				||
				<button id="SendFriendRequest_buttons" onClick={() => props.sendFriendshipRequest(props.user)} />
			}
		</div>
	)
}

export default PrintFriend;
