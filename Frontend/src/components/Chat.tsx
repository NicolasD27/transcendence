import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import user1 from "../asset/friend1.svg"

export interface PropsChat {
	setChatFriendState : Dispatch<SetStateAction<boolean>>;
}

const Chat : React.FC<PropsChat> = (props) => {
	const username = "Leslie Alexander"
	//const friendName = username.replace(/ /g, "\n");

	return (
		<div className='chatArea'>
			<div id='chatTop'>
				<button id='chatCloseButton' onClick={() => props.setChatFriendState(false)}/>
				<div id='friendChatAvatarIcon'>
					<img src={user1} className="friendchatAvatar" alt="friendAvatar"/>
					<img src={statusIconGreen} className="friendchaStatusIcon" alt="friendchaStatusIcon"/>
				</div>
				<div id="chatUsername">{username}</div>
			</div>
			<div className='messageArea'></div>
			<div id="sendTextArea">
				<div id='writingTextArea'>
					<input type='text' placeholder='Aa' name='searchFriend'  /*onChange={handleSearchRequest}*/ />
				</div>
				<button id="sendTextIcon"/>
			</div>
		</div>
	)
}

export default Chat;