import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import {PropsStateChannel} from './ChatSectionUsers'

interface PropsPrintChannelsJoined {
	channel : PropsStateChannel;
	chatChannelState : boolean;
	setChatChannelState : Dispatch<SetStateAction<boolean>>;
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
				<button id="channelChat_button" onClick={() => props.setChatChannelState(!props.chatChannelState)}/>
			</div>
		</div>
	)
}

export default PrintChannelsJoined;