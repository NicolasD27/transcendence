import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';
import statusIconGreen from "../asset/statusIconGreen.svg"
import statusIconRed from "../asset/statusIconRed.svg"
import user1 from "../asset/friend1.svg"
import ChatSectionUsers from './ChatSectionUsers';
import Conversation from './Conversation';
import { chatStateFormat } from '../App';

export interface PropsChat {
	idMe : number;
	socket : any;
	chatParamsState : chatStateFormat;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	isFriendshipButtonClicked : boolean;
	setIsFriendshipButtonClicked : Dispatch<SetStateAction<boolean>>;
}

const Chat : React.FC<PropsChat> = (props) => {
	const [ chatParamsState, setChatParamsState ] = useState<chatStateFormat>({'chatState' : false, id : 0, chatName : "" , type : "directMessage" })
	const idMe = props.idMe;

	return (
		<>
			{!props.chatParamsState.chatState && <ChatSectionUsers socket={props.socket} idMe={idMe} setChatParamsState={setChatParamsState} chatParamsState={chatParamsState} isFriendshipButtonClicked={props.isFriendshipButtonClicked} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} />}
			{ chatParamsState.chatState && <Conversation idMe={idMe} id={chatParamsState.id} type={chatParamsState.type} nameChat={chatParamsState.chatName} socket={props.socket} setChatState={setChatParamsState}/>}
		</>
	)
}

export default Chat;