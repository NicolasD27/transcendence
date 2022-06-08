import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import {FriendsFormat }  from './Chat'
import { PropsStateChannel } from './ChatSectionUsers';
import { chatStateFormat } from '../App'

interface PropsPrintChannelsJoined {
	channel : PropsStateChannel;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
}

const PrintChannelsJoined : React.FC<PropsPrintChannelsJoined> = (props) => {
	const [ isMute, setIsMute ]= useState(false)
	return (
		<div className='channel'>
			<div id='channelAvatarIcon'></div>
			<div id="channelName">{props.channel.name}</div>
			<div id="channel_buttons">
				{
					!isMute && <button id="muteChannel" onClick={() => setIsMute(true)}/> ||
					<button id="unmuteChannel" onClick={() => setIsMute(false)}/>
				}
				<button id="channelChat_button" onClick={() => props.setChatParamsState({'chatState' : !props.chatParamsState.chatState, 'id' : props.channel.id , 'chatName' : props.channel.name , type : 'channel'})}/>
			</div>
		</div>
	)
}

export default PrintChannelsJoined;