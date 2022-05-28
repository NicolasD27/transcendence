import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';
import { PropsStateUsers } from './ChatSectionUsers'

interface PropsPrintNormalFriendProfile {
	user : PropsStateUsers;
	setFriendDeleteColumnState : Dispatch<SetStateAction<boolean>>;
	setChatFriendState :  Dispatch<SetStateAction<boolean>>;
	isBlocked : boolean;
	setIsBlocked : Dispatch<SetStateAction<boolean>>;
}

const PrintNormalFriendProfile : React.FC<PropsPrintNormalFriendProfile> = (props) => {
	
	return (
		<>
			<div id="username">{props.user.pseudo}</div>
					<div id='friend_buttons'>
						{(!props.isBlocked &&
							<>
								<button id="friendPlay_button" onClick={() => ""}/>
								<button id="friendChat_button" onClick={() => props.setChatFriendState(true)}/>
							</>
						) ||
							<div id='profileBlocked'>
								Blocked
							</div>
						}
						<button id="friendColumn_button" onClick={() => props.setFriendDeleteColumnState(true)}/>
					</div>
		</>
	)
}

export default PrintNormalFriendProfile;