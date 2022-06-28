import React, { Dispatch, SetStateAction} from 'react';
import './PrintUnfriendBlockProfile.css'
import { PropsStateUsers } from './ChatSectionUsers'
import { FriendsFormat } from '../App'
import { FriendshipStatus } from './PrintFriend'
import axios from 'axios';

interface PropsPrintUnfriendBlockProfile {
	user:  PropsStateUsers;
	friendshipId : number;
	friendshipStatus : number;
	setFriendshipStatus : Dispatch<SetStateAction<number>>;
	setFriendDeleteColumnState : Dispatch<SetStateAction<boolean>>;
	deleteFriend : Function;
	isBlocked : boolean;
	setIsBlocked : Dispatch<SetStateAction<boolean>>;
	blockedByFriend : boolean;
}

const PrintUnfriendBlockProfile : React.FC<PropsPrintUnfriendBlockProfile> = (props) => {

	const handleClick = () => {
		if (!props.isBlocked){
			axios
			.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.friendshipId}/block`, { } ,{ withCredentials: true })
			.then(res => {
				props.setFriendshipStatus(res.data.status)
				props.setIsBlocked(!props.isBlocked)
			})
			.catch((err) => console.log(err))
		}
		else {
			axios
			.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.friendshipId}`, { status : FriendshipStatus.ACTIVE } ,{ withCredentials: true })
			.then(res => {
				props.setFriendshipStatus(res.data.status)
				props.setIsBlocked(!props.isBlocked)
			})
			.catch((err) => console.log(err))
		}
	}

	return (
		<>
			<div className='optionButtons'>
				<button id='unfriend_button' onClick={() => props.deleteFriend(props.user)}>
						<p>Unfriend</p>
				</button>
				{
						(!props.blockedByFriend && !props.isBlocked &&
						(<button id='block_buttons' onClick={handleClick}>
							Block
						</button>)) ||
						(!props.blockedByFriend && <button id='unblock_buttons' onClick={handleClick}>
							Unblock
						</button>)
				}
			</div>
			<button id="unfriendColumnButton" onClick={() => props.setFriendDeleteColumnState(false)}/>
		</>
	)
}

export default PrintUnfriendBlockProfile;