import React, {  useState, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PropsStateUsers } from './ChatSectionUsers'
import { chatStateFormat } from '../App';
import PrintNormalFriendProfile from './PrintNormalFriendProfile';
import PrintUnfriendBlockProfile from './PrintUnfriendBlockProfile';
import './PrintFriend.css'

interface PropsPrintFriend {
	idMe : number;
	socket : any;
	user :  PropsStateUsers;
	friendshipId : number;
	statusIcon : string;
	isFriend: boolean;
	received : boolean;
	sent : boolean;
	sendFriendshipRequest : Function;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
	matchId : number;
	goToMatch : Function;
	key : number;
}

interface MyInfo {
	"username": string,
	"pseudo": string,
}

const PrintFriend : React.FC<PropsPrintFriend> = (props) => {
	const [ profileAvatar, setProfileAvatar ] = useState("")
	const [ friendDeleteColumnState, setFriendDeleteColumnState ] = useState(false)
	const [ isBlocked, setIsBlocked ]= useState(false)
	const [ myInfo, setMyInfo ] = useState<MyInfo>({username : "", pseudo : ""})
	const [ friendshipStatus, setFriendshipStatus ] = useState(0)
	const navigate = useNavigate()

	useEffect(() => {
		if(props.idMe)
		{
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${props.idMe}`, {withCredentials: true})
				.then((resp) => setMyInfo({
					username : resp.data.username,
					pseudo : resp.data.pseudo
				}))
				.catch((err) => console.log(err))
		}
	}, [props.idMe])

	useEffect(() => {
		if(props.idMe)
		{
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.idMe}`, {withCredentials: true})
				.then((resp) =>
					{
						const friends = resp.data
						for(let i = 0; i < friends.length; i++)
						{
							if (friends[i].id === props.friendshipId)
							{
								setFriendshipStatus(friends[i].status)
								console.log('STATUS:',friends[i].status )
								return ;
							}
						}
					}
				)
				.catch((err) => console.log(err))
		}
	}, [props.idMe, props.friendshipId])

	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
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
			})
			.catch((err) =>
				console.log(err))
	}

	const sendMatchInvit = () => {
		if (props.socket)
			props.socket.emit('challenge_user', { opponent_id: props.user.id.toString(), author: myInfo.username})
	}

	return (
			<div className='user'>
				<div className='flex-v-centered'>
					<div id='userAvatarIcon'>
						<img src={props.user.avatarId ? profileAvatar : defaultAvatar} className="userAvatar" alt="Avatar" onClick={() => onProfil(props.user.id.toString())}/>
						<img src={props.statusIcon} className="userStatusIcon" alt="StatutIcon"/>
					</div>
					{!friendDeleteColumnState && <div id="username">{props.user.pseudo}</div>}
				</div>
				{
					(props.isFriend &&
						!friendDeleteColumnState && <PrintNormalFriendProfile user={props.user} friendshipId={props.friendshipId} friendshipStatus={friendshipStatus} setFriendDeleteColumnState={setFriendDeleteColumnState} setChatParamsState={props.setChatParamsState} chatParamsState={props.chatParamsState} isBlocked={isBlocked} setIsBlocked={setIsBlocked} sendMatchInvit={sendMatchInvit} matchId={props.matchId} goToMatch={props.goToMatch}/>)
					||
					(props.isFriend &&
						friendDeleteColumnState && <PrintUnfriendBlockProfile user={props.user} friendshipId={props.friendshipId} friendshipStatus={friendshipStatus} setFriendshipStatus={setFriendshipStatus} setFriendDeleteColumnState={setFriendDeleteColumnState} deleteFriend={deleteFriend} isBlocked={isBlocked} setIsBlocked={setIsBlocked}/>)
					||
					(props.received &&

						<div id='friendRequest_buttons'>
							<p>Pending ...</p>
						</div>
					)
					||
					(props.sent &&

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