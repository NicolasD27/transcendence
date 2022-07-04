import React, { Dispatch, SetStateAction, useState } from 'react';
import './PrintUnfriendBlockProfile.css'
import { PropsStateUsers } from './ChatSectionUsers'
import { FriendshipStatus } from './PrintFriend'
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
		props.socket.emit('refreshFriendList');
	}

	const handleDelete  = () => {
		props.deleteFriend(props.user)
		//setIsBlocked(false)
	}

	return (
		<>
			<div className='optionButtons'>
				{
					(!props.blockedByFriend && !isBlocked &&
						<>
							<button id='unfriend_button' onClick={handleDelete}>
								<p>Unfriend</p>
							</button>
							<button id='block_buttons' onClick={handleClick}>
								Block
							</button>
						</>) 
					||
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