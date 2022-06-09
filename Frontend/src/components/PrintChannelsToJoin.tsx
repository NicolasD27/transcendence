import React, { useState, useEffect, Dispatch, SetStateAction} from 'react';
import axios from 'axios';
import {PropsStateChannel} from './ChatSectionUsers'

interface PropsPrintChannelsToJoin {
	channel : PropsStateChannel;
	joinedChannels : PropsStateChannel[];
	setJoiningChannel : Dispatch<SetStateAction<boolean>>;
}

const PrintChannelsToJoin : React.FC<PropsPrintChannelsToJoin> = (props) => {
	const [ isButtonClicked, setIsButtonClicked ] = useState(false)
	const [ enteredPassword, setEnteredPassword ] = useState("")

	const handleEnteredPassword = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		setEnteredPassword(e.target.value);
	}

	const sendPassword = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		axios
			.post(`http://localhost:8000/api/channels/${props.channel.id}/join`, {"password" : enteredPassword}, { withCredentials: true })
			.then(() => props.setJoiningChannel(true))
			.catch((error) => console.log(error.data))
	}

	const handleClick = () => {
		//setIsButtonClicked(true)
		if (props.channel.isProtected === false)
			sendPassword("")
	}

	return (
		<div className='channel'>
			<div id='channelAvatarIcon'></div>
			{
				(
					!isButtonClicked &&
						<>
							<div id="channelName">{props.channel.name}</div>
							<button id="channelSendRequest_buttons" onClick={handleClick}/>
						</>
				) ||
				(
					props.channel.isProtected === true && 
						<div id="channelPassword">
							<input type="password" placeholder="Password" onChange={handleEnteredPassword} required/>
							<button id="confirmPassword" onClick={sendPassword}/>
						</div>				 
				)
			}
		</div>
	)
}

export default PrintChannelsToJoin;