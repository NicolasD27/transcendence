import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';
import { useNavigate } from 'react-router-dom';
import { PropsStateUsers } from './ChatSectionUsers'

interface PropsPrintInvitationSentProfile {
	user : PropsStateUsers;
	statusIcon : string;
	key : number;
}

const PrintInvitationSentProfile : React.FC<PropsPrintInvitationSentProfile> = (props) => {
	const [ profileAvatar, setProfileAvatar ] = useState("")

	const defaultAvatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	
	const navigate = useNavigate()
	
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	useEffect(() => {
		if (props.user.avatarId != null)
			setProfileAvatar(`http://localhost:8000/api/database-files/${props.user.avatarId}`)
	}, [])

	return (
		<>
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
				<div id='invitation_sent'>
					Invitation Sent
				</div>
			</div>
		</>
	)
}

export default PrintInvitationSentProfile;