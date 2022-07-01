import React, { Dispatch, SetStateAction} from 'react';
import { chatStateFormat } from '../App';
import { PropsStateUsers } from './ChatSectionUsers'
import './PrintNormalFriendProfile.css'

interface PropsPrintNormalFriendProfile {
	user: PropsStateUsers;
	friendshipId: number;
	setFriendDeleteColumnState: Dispatch<SetStateAction<boolean>>;
	setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState: chatStateFormat;
	isUserBlocked: boolean;
	matchId: number;
	goToMatch: Function;
	blockedByFriend: boolean;
	socket: any;
}

const PrintNormalFriendProfile: React.FC<PropsPrintNormalFriendProfile> = (props) => {


	const sendMatchInvit = () => {
		if (props.socket) {
			console.log("challenging")
			props.socket.emit('challenge_user', { opponent_id: props.user.id.toString() })
		}
	}


	return (
		<>
			<div id='friend_buttons'>
				{
					(!props.isUserBlocked && !props.blockedByFriend &&
						<>
							{props.user.status !== 3 && <button id="friendPlay_button" onClick={sendMatchInvit} />}
							{props.user.status === 3 && <button id="friendWatch_button" onClick={() => props.goToMatch(props.matchId)} />}
							<button id="friendChat_button" onClick={() => props.setChatParamsState({ 'chatState': !props.chatParamsState.chatState, 'id': props.user.id, 'chatName': props.user.username, type: 'directMessage' })} />
						</>
					) ||
					(props.blockedByFriend &&
						<div id='blockedByFriend'>
							You Are Blocked
						</div>
					) ||
					(
						<div id='profileBlocked'>
							Blocked
						</div>
					)
				}
				<button id="friendColumn_button" onClick={() => props.setFriendDeleteColumnState(true)} />
			</div>
		</>
	)
}

export default PrintNormalFriendProfile;