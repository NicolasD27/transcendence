import React, {  useState, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PropsStateUsers } from './ChatSectionUsers'
import { FriendsFormat } from '../components/Chat'
import { chatStateFormat } from '../App';
import PrintNormalFriendProfile from './PrintNormalFriendProfile';
import PrintUnfriendBlockProfile from './PrintUnfriendBlockProfile';

interface PropsPrintFriend {
	user :  PropsStateUsers;
	statusIcon : string;
	isFriend: boolean;
	received : boolean;
	sent : boolean;
	sendFriendshipRequest : Function;
	/*acceptFriendshipRequest : Function;
	declineFriendshipRequest: Function;*/
	friends : FriendsFormat[];
	friendshipInfo : FriendsFormat;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
	key : number;
}

const PrintFriend : React.FC<PropsPrintFriend> = (props) => {
	const [ profileAvatar, setProfileAvatar ] = useState("")
	const [ friendDeleteColumnState, setFriendDeleteColumnState ] = useState(false)
	const [ isBlocked, setIsBlocked ]= useState(false)

	const navigate = useNavigate()
	
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	const defaultAvatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
	
	useEffect(() => {
		if (props.user.avatarId != null)
			setProfileAvatar(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${props.user.avatarId}`)
	}, [])

	const deleteFriend = (user : PropsStateUsers) => {
		for (let i = 0; i < props.friends.length; i++)
		{
			if (props.friends[i].id === props.user.id)
			{
				axios
					.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.friends[i].friendshipId}`, { withCredentials: true })
					.then(() => {
						props.setIsFriendshipButtonClicked(true)
					})
					.catch((err) =>
						console.log(err))
			}
		}
	}

	return (
			<div className='user'>
				<div className='flex-v-centered'>
					<div id='userAvatarIcon'>
						<img src={props.user.avatarId ? profileAvatar : defaultAvatar} className="userAvatar" alt="Avatar" onClick={() => onProfil(props.user.id.toString())}/>
						<img src={props.statusIcon} className="userStatusIcon" alt="StatutIcon"/>
					</div>
					<div id="username">{props.user.pseudo}</div>
				</div>
				{
					props.isFriend && 
						!friendDeleteColumnState && <PrintNormalFriendProfile user={props.user} setFriendDeleteColumnState={setFriendDeleteColumnState} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} isBlocked={isBlocked} setIsBlocked={setIsBlocked}/>
					||
					props.isFriend && 
						friendDeleteColumnState && <PrintUnfriendBlockProfile user={props.user} setFriendDeleteColumnState={setFriendDeleteColumnState} deleteFriend={deleteFriend} isBlocked={isBlocked} setIsBlocked={setIsBlocked}/>
					||
					props.received && 
					(
						<div id='friendRequest_buttons'>
							<p>Pending ...</p>
						</div>
					) ||
					props.sent && 
					(
						<div id='invitation_sent'>
							<p>Invitation Sent</p>
						</div>
					) ||
					<button id="SendFriendRequest_buttons" onClick={() => props.sendFriendshipRequest(props.user)}/>
				}
			</div>
	)
}

export default PrintFriend;