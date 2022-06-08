import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react'
import Match from '../components/Match'
import ChatSectionUsers from '../components/ChatSectionUsers'
import Chat from '../components/Chat'
import { PropsStateUsers } from '../components/ChatSectionUsers'
import Conversation from '../components/Conversation'
import { chatStateFormat } from '../App'

interface PropsBody {
	idMe: number;
	socket: any;
	isFriendshipButtonClicked : boolean;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
	chatParamsState : chatStateFormat;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
}


const Body : React.FC<PropsBody> = (props) => {
	const idMe = props.idMe;
	const [ users, setUsers ] = useState<PropsStateUsers[]>([])
	const  [ userstate, setUserState ] = useState(false);
	//const [ isFriendshipButtonClicked, setIsFriendshipButtonClicked ] = useState<boolean>(true)
	//const [ chatChannelState, setChatChannelState ] = useState(false)

	return (
		<section id="gameAndChatSection">
			<div className='gameArea' id='gameArea'></div>
			<Match socket={props.socket}/>
			<Chat idMe={props.idMe} socket={props.socket} chatParamsState={props.chatParamsState} setChatParamsState={props.setChatParamsState} isFriendshipButtonClicked={props.isFriendshipButtonClicked} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}/>
			{/*{(!chatParamsState.chatState && <ChatSectionUsers socket={props.socket} idMe={idMe} /*users={users} setUsers={setUsers} setChatParamsState={setChatParamsState} chatParamsState={chatParamsState} isFriendshipButtonClicked={props.isFriendshipButtonClicked} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked}/>)
			chatParamsState.chatState && <Conversation idMe={idMe} id={chatParamsState.id} type={chatParamsState.type} nameChat={chatParamsState.chatName} socket={props.socket} setChatState={setChatParamsState}/>*/}
		</section>
	)
}

export default Body;