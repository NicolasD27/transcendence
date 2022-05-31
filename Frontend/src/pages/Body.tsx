import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react'
import Match from '../components/Match'
import ChatSectionUsers from '../components/ChatSectionUsers'
import Chat from '../components/Chat'
import { PropsStateUsers } from '../components/ChatSectionUsers'
import Conversation from '../components/Conversation'

interface PropsBody {
	idMe: number;
	socket: any
}

export interface chatStateFormat {
	chatState : boolean;
	id : number;
	chatName : string;
	type : string;
}

const Body : React.FC<PropsBody> = (props) => {
	const idMe = props.idMe;
	const [ users, setUsers ] = useState<PropsStateUsers[]>([])
	const  [ userstate, setUserState ] = useState(false);
	const [ chatParamsState, setChatParamsState ] = useState<chatStateFormat>({'chatState' : false, id : 0, chatName : "" , type : "chat" })
	//const [ chatChannelState, setChatChannelState ] = useState(false)
 
	return (
		<section id="gameAndChatSection">
			<div className='gameArea' id='gameArea'></div>
			<Match socket={props.socket}/>
			{(!chatParamsState.chatState && <ChatSectionUsers socket={props.socket} idMe={idMe} /*users={users} setUsers={setUsers}*/ setChatParamsState={setChatParamsState} chatParamsState={chatParamsState}/*chatChannelState={chatState} setChatChannelState={setChatChannelState}*//>)}
			{ chatParamsState.chatState && <Conversation idMe={idMe} id={chatParamsState.id} type={chatParamsState.type} nameChat={chatParamsState.chatName} socket={props.socket} setChatState={setChatParamsState}/>}
		</section>
	)
}

export default Body;