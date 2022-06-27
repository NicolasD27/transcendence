import React, { Dispatch, SetStateAction} from 'react';
import { chatStateFormat } from '../App';
import { PropsStateUsers } from './ChatSectionUsers'
import './PrintNormalFriendProfile.css'

interface PropsPrintNormalFriendProfile {
	user : PropsStateUsers;
	setFriendDeleteColumnState : Dispatch<SetStateAction<boolean>>;
	setChatParamsState :  Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	isBlocked : boolean;
	setIsBlocked : Dispatch<SetStateAction<boolean>>;
	sendMatchInvit  : Function;
	matchId : number;
	goToMatch : Function;
}

const PrintNormalFriendProfile : React.FC<PropsPrintNormalFriendProfile> = (props) => {
	
	return (
		<>
			<div id='friend_buttons'>
				{
					(!props.isBlocked &&
						<>
							{props.user.status !== 3 && <button id="friendPlay_button" onClick={() => props.sendMatchInvit()}/>}
							{props.user.status === 3  && <button id="friendWatch_button" onClick={() => props.goToMatch(props.matchId)}/>}
							<button id="friendChat_button" onClick={() => props.setChatParamsState({'chatState': !props.chatParamsState.chatState, 'id' : props.user.id, 'chatName' : props.user.pseudo , type : 'directMessage' })}/>
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