import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react'
import Match from '../components/Match'
import ChatSectionUsers from '../components/ChatSectionUsers'
import Chat from '../components/Chat'
import { PropsStateUsers } from '../components/ChatSectionUsers'

interface PropsBody {
	idMe: number;
	socket: any
}

const Body : React.FC<PropsBody> = (props) => {
	const idMe = props.idMe;
	const [ users, setUsers ] = useState<PropsStateUsers[]>([])
	const  [ userstate, setUserState ] = useState(false);
	const [ chatFriendState, setChatFriendState ] = useState(false)
	const [ chatChannelState, setChatChannelState ] = useState(false)

 
	return (
		<section id="gameAndChatSection">
			<div className='gameArea' id='gameArea'></div>
			<Match socket={props.socket}/>
			{(!chatFriendState && <ChatSectionUsers socket={props.socket} idMe={idMe} /*users={users} setUsers={setUsers}*/ setChatFriendState={setChatFriendState} chatChannelState={chatChannelState} setChatChannelState={setChatChannelState}/>)
			|| (<Chat setChatFriendState={setChatFriendState}/>)}
		</section>
	)
}

export default Body;