import React, { Dispatch, SetStateAction } from 'react'
import Match from '../components/Match'
import Chat from '../components/Chat'
import { chatStateFormat } from '../App'
import { useSearchParams } from 'react-router-dom';

interface PropsBody {
	idMe: number;
	socket: any;
	isFriendshipButtonClicked: boolean;
	setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>;
	chatParamsState: chatStateFormat;
	setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>;
}


const Body: React.FC<PropsBody> = (props) => {
	const [searchParams, setSearchParams] = useSearchParams();


	return (
		<section id="gameAndChatSection">
			<div className='gameArea' id='gameArea'></div>
			{<Match socket={props.socket} idMatch={searchParams.get('id')}/>}
			<Chat idMe={props.idMe} socket={props.socket} chatParamsState={props.chatParamsState} setChatParamsState={props.setChatParamsState} isFriendshipButtonClicked={props.isFriendshipButtonClicked} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}/>
		</section>
	)
}

export default Body;