import React, { Dispatch, SetStateAction, useState } from 'react';
import './PrintUnfriendBlockProfile.css'
import { PropsStateUsers } from './ChatSectionUsers'
import { FriendshipStatus } from './PrintFriend'
import axios from 'axios';
import { userInfo } from 'os';

interface PropsPrintUnfriendBlockProfile {
	socket : any;
	user: PropsStateUsers;
	friendshipId: number;
	friendshipStatus : number;
	setFriendDeleteColumnState: Dispatch<SetStateAction<boolean>>;
	deleteFriend: Function;
	isUserBlocked: boolean;
	//setIsBlocked: Dispatch<SetStateAction<boolean>>;
	blockedByFriend: boolean;
}

const PrintUnfriendBlockProfile: React.FC<PropsPrintUnfriendBlockProfile> = (props) => {

	const [isBlocked, setIsBlocked] = useState(props.isUserBlocked)

	const handleClick = () => {
		if (!props.isUserBlocked) {
			props.socket.emit(`update_friendship_state`, { receiver: props.user.id , status: FriendshipStatus.BLOCKED_BY_FOLLOWER})
			setIsBlocked(!isBlocked)
		}
		else {
			props.socket.emit(`update_friendship_state`, { receiver: props.user.id , status: FriendshipStatus.ACTIVE})
			setIsBlocked(!isBlocked)
		}
	}

	return (
		<>
			<div className='optionButtons'>
				<button id='unfriend_button' onClick={() => props.deleteFriend(props.user)}>
					<p>Unfriend</p>
				</button>
				{
					(!props.blockedByFriend && !isBlocked &&
						(<button id='block_buttons' onClick={handleClick}>
							Block
						</button>)) ||
					(!props.blockedByFriend && <button id='unblock_buttons' onClick={handleClick}>
						Unblock
					</button>)
				}
			</div>
			<button id="unfriendColumnButton" onClick={() => props.setFriendDeleteColumnState(false)} />
		</>
	)
}

export default PrintUnfriendBlockProfile;