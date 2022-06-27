import React, { Dispatch, SetStateAction } from 'react'
import Match from '../components/Match'
import Chat from '../components/Chat'
import { chatStateFormat } from '../App'
import { useSearchParams } from 'react-router-dom';
import { FriendsFormat } from '../App'

interface PropsBody {
	idMe: number;
	socket: any;
	friends : FriendsFormat[];
	setFriends : Dispatch<SetStateAction<FriendsFormat[]>>;
	isFriendshipButtonClicked: boolean;
	setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>;
	chatParamsState: chatStateFormat;
	setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>;
	friendRequestsSent : number[];
	setFriendRequestsSent : Dispatch<SetStateAction<number[]>>;
	friendRequestsReceived : FriendsFormat[];
	setFriendRequestsReceived : Dispatch<SetStateAction<FriendsFormat[]>>;
}

const Body: React.FC<PropsBody> = (props) => {
	const [searchParams, setSearchParams] = useSearchParams();

	return (
		<section className="gameAndChatSection">
			<div className='gameArea' id='gameArea'>
			{<Match socket={props.socket} idMatch={searchParams.get('id')}/>}
			</div>
			<Chat idMe={props.idMe} socket={props.socket} friends={props.friends} setFriends={props.setFriends} chatParamsState={props.chatParamsState} setChatParamsState={props.setChatParamsState} isFriendshipButtonClicked={props.isFriendshipButtonClicked} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} friendRequestsSent={props.friendRequestsSent} setFriendRequestsSent={props.setFriendRequestsSent} friendRequestsReceived={props.friendRequestsReceived} setFriendRequestsReceived={props.setFriendRequestsReceived}/>
		</section>
	)
}

export default Body;