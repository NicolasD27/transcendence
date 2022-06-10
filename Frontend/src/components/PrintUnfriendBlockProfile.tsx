import React, { Dispatch, SetStateAction} from 'react';
import { PropsStateUsers } from './ChatSectionUsers'

interface PropsPrintUnfriendBlockProfile {
	user:  PropsStateUsers;
	setFriendDeleteColumnState : Dispatch<SetStateAction<boolean>>;
	deleteFriend : Function;
	isBlocked : boolean;
	setIsBlocked : Dispatch<SetStateAction<boolean>>;
}

const PrintUnfriendBlockProfile : React.FC<PropsPrintUnfriendBlockProfile> = (props) => {
	return (
		<>
			<div className='optionButtons'>
				<button id='unfriend_button' onClick={() => props.deleteFriend(props.user)}>
						<p>Unfriend</p>
				</button>
				{
						(!props.isBlocked &&
						(<button id='block_buttons' onClick={() => props.setIsBlocked(true)}>
							Block
						</button>)) ||
						(<button id='unblock_buttons' onClick={() => props.setIsBlocked(false)}>
							Unblock
						</button>)
				}
			</div>
			<button id="unfriendColumnButton" onClick={() => props.setFriendDeleteColumnState(false)}/>
		</>
	)
}

export default PrintUnfriendBlockProfile;