import React, { useState, Dispatch, SetStateAction} from 'react';
import axios from 'axios';
import {PropsStateChannel} from './ChatSectionUsers'
import { chatStateFormat } from '../App'


interface PropsPrintChannelsToJoin {
	channel : PropsStateChannel;
	setJoiningChannel : Dispatch<SetStateAction<boolean>>;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
    isMember : boolean;
    key: number;
}

const PrintChannels : React.FC<PropsPrintChannelsToJoin> = (props) => {
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
		if (props.channel.isProtected === false)
			sendPassword("")
        else
		    setIsButtonClicked(true)
	}

	return (
		<div className='channel'>
			<div id='channelAvatarIcon'></div>
			{
                props.isMember &&
                <>
                    <div id="channelName">{props.channel.name}</div>
                    <div id="channel_buttons">
                        <button id="channelChat_button" onClick={() => props.setChatParamsState({'chatState' : !props.chatParamsState.chatState, 'id' : props.channel.id , 'chatName' : props.channel.name , type : 'channel'})}/>
                    </div>
                </>
            }
            {
                !props.isMember &&
                (
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
                )
			}
		</div>
	)
}

export default PrintChannels;