import React, { useState, Dispatch, SetStateAction, useEffect, Fragment, ReactNode} from 'react'
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

	const defaultAvatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false';
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


	const renderOneFriend = (user) => {
		let statusIcon = (user.status === 1 ? statusIconGreen : statusIconRed)
		const profileAvatar = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${user.avatarId}`
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
	}

	const renderFriends = () => {
		return props.friends.filter(friend => {
			if (friend.id !== props.idMe)
				return friend;
			return false
		})
		.map((user:FriendsFormat) => {
			return renderOneFriend(user)
		})
	}





	return (
		<Fragment>
			{renderFriends()}
		</Fragment>

	)
}

export default PrintFriendToAddChannel;