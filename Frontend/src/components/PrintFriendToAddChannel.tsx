import React, { useState, Dispatch, SetStateAction} from 'react'
import { useNavigate } from 'react-router-dom'
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import {FriendsFormat} from './Chat'

interface PropsPrintFriendToAddChannel {
	idMe : number;
	friends : FriendsFormat[];
	selectedFriend : FriendsFormat[];
	setSelectedFriend : Dispatch<SetStateAction<FriendsFormat[]>>;
}

const PrintFriendToAddChannel : React.FC<PropsPrintFriendToAddChannel> = (props) => {

	const [ profileAvatar, setProfileAvatar ] = useState("")
	const defaultAvatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	const navigate = useNavigate()

	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}

	const checkSelectionStatus = (user:any) => {
		if (props.selectedFriend.filter((friend:any) => friend.id === user.id).length === 0) {
			var newArrayAdding = [...props.selectedFriend, user]
			props.setSelectedFriend(newArrayAdding)
		}
		else {
			var newArrayDeletion = props.selectedFriend.filter((friend:any) => friend.id !== user.id)
			props.setSelectedFriend(newArrayDeletion)
		}
	}

	return (
		<>
			{props.friends
				.filter(friend => {
					if (friend.id !== props.idMe)
						return friend;
					return false
				})
				.map((user:FriendsFormat) => {
					let statusIcon = (user.status === 1 ? statusIconGreen : statusIconRed)

					if (user.avatarId != null)
						setProfileAvatar(`http://localhost:8000/api/database-files/${user.avatarId}`)

					return (
						<div className='user' key={user.id}>
							<div id='userAvatarIcon'>
								{
									user.avatarId == null && 
									<img src={defaultAvatar} className="userAvatar" alt="defaultAvatar" onClick={() => onProfil(user.id.toString())}/>
								}
								{
									user.avatarId != null &&
									<img src={profileAvatar} className="userAvatar" alt="profileAvatar" onClick={() => onProfil(user.id.toString())}/> 
								}
								<img src={statusIcon} className="userStatusIcon" alt="StatusIcon"/>
							</div>
							<div id="username">{user.username}</div>
							<div className='checkbox_Channel'>
								<input type='checkbox' name="addFriendToChannelButton" id={user.id.toString()} onChange={() => checkSelectionStatus(user)}/>
								<label htmlFor={user.id.toString()}></label>
							</div>
						</div>
					)
				})
			}
		</>
	)
}

export default PrintFriendToAddChannel;