import React, { Dispatch, SetStateAction } from 'react'
import Match from '../components/Match'
import Chat from '../components/Chat'
import { chatStateFormat } from '../App'

interface PropsBody {
	idMe: number;
	socket: any;
	isFriendshipButtonClicked: boolean;
	setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>;
	chatParamsState: chatStateFormat;
	setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>;
}


const Body: React.FC<PropsBody> = (props) => {
	return (
		<section id="gameAndChatSection">
			<div className='gameArea' id='gameArea'></div>
			{<Match socket={props.socket}/>}
			<Chat idMe={props.idMe} socket={props.socket} chatParamsState={props.chatParamsState} setChatParamsState={props.setChatParamsState} isFriendshipButtonClicked={props.isFriendshipButtonClicked} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}/>
		</section>
	)
}

export default Body;