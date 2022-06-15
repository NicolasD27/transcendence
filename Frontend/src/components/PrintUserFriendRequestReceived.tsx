import React, {  useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { PropsStateUsers } from './ChatSectionUsers'
import { FriendsFormat } from '../components/Chat'

interface PropsPrintUserFriendRequestReceived {
	user :  PropsStateUsers;
	statusIcon : string;
	/*acceptFriendshipRequest : Function;
	declineFriendshipRequest: Function;*/
	friendshipInfo : FriendsFormat;
	key : number;
}

const PrintUserFriendRequestReceived : React.FC<PropsPrintUserFriendRequestReceived> = (props) => {
	const [ profileAvatar, setProfileAvatar ] = useState("")

	const navigate = useNavigate()

	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	const defaultAvatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';

	useEffect(() => {
		if (props.user.avatarId != null)
			setProfileAvatar(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${props.user.avatarId}`)
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
					<p>Pending ...</p>
					{/*<button id="AcceptFriendButton" onClick={() => props.acceptFriendshipRequest(props.user.id, props.friendshipInfo)} />
					<button id="DeclineFriendButton" onClick={() => props.declineFriendshipRequest(props.user.id, props.friendshipInfo)} />*/}
				</div>
			</div>
	)
}

export default PrintUserFriendRequestReceived;