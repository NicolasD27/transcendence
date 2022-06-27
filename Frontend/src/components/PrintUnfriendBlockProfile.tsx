import React, { Dispatch, SetStateAction} from 'react';
import './PrintUnfriendBlockProfile.css'
import { PropsStateUsers } from './ChatSectionUsers'
import { FriendsFormat } from '../App'
import axios from 'axios';

interface PropsPrintUnfriendBlockProfile {
	user:  PropsStateUsers;
	friendshipInfo : FriendsFormat;
	setFriendDeleteColumnState : Dispatch<SetStateAction<boolean>>;
	deleteFriend : Function;
	isBlocked : boolean;
	setIsBlocked : Dispatch<SetStateAction<boolean>>;
}

const PrintUnfriendBlockProfile : React.FC<PropsPrintUnfriendBlockProfile> = (props) => {
	
	const handleClick = () => {
		props.setIsBlocked(!props.isBlocked)
		let stat = props.isBlocked == true ? 1 : 2;  
		axios
			.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.friendshipInfo.friendshipId}`, { status : stat} ,{ withCredentials: true })
			.then(res => { })
			.catch((err) => console.log(err))
	} 

	return (
		<>
			<div className='optionButtons'>
				<button id='unfriend_button' onClick={() => props.deleteFriend(props.user)}>
						<p>Unfriend</p>
				</button>
				{
						(!props.isBlocked &&
						(<button id='block_buttons' onClick={handleClick}/*() => props.setIsBlocked(true)}*/>
							Block
						</button>)) ||
						(<button id='unblock_buttons' onClick={handleClick}/*() => props.setIsBlocked(false)}*/>
							Unblock
						</button>)
				}
			</div>
			<button id="unfriendColumnButton" onClick={() => props.setFriendDeleteColumnState(false)}/>
		</>
	)
}

export default PrintUnfriendBlockProfile;