import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import { useNavigate } from 'react-router-dom';
import { PropsStateUsers } from './ChatSectionUsers'

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

export default PrintSendFriendRequestProfile;