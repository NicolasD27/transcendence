import React, { Dispatch, SetStateAction } from 'react'
import Match from '../components/Match'
import Chat from '../components/Chat'
import './Body.css'
import { chatStateFormat } from '../App'
import { useSearchParams } from 'react-router-dom';
import { FriendsFormat } from '../App'

interface PropsBody {
	idMe: number;
	socket: any;
	friends: FriendsFormat[];
	setFriends: Dispatch<SetStateAction<FriendsFormat[]>>;
	isFriendshipButtonClicked: boolean;
	setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>;
	chatParamsState: chatStateFormat;
	setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>;
	friendRequests : number[];
	setFriendRequests : Dispatch<SetStateAction<number[]>>;
	blockedByUsers : number[];
	setInPlay: Dispatch<SetStateAction<boolean>>;
	matchLaunched : boolean;
	setMatchLaunched: Dispatch<SetStateAction<boolean>>;
}

const Body: React.FC<PropsBody> = (props) => {
	const [searchParams] = useSearchParams();


	return (
		<section className="gameAndChatSection">
			<div className='gameArea' id='gameArea'>
				{<Match socket={props.socket} matchLaunched={props.matchLaunched} setMatchLaunched={props.setMatchLaunched} idMatch={searchParams.get('id')} setInPlay={props.setInPlay} />}
			</div>
			<Chat idMe={props.idMe} socket={props.socket} friends={props.friends} setFriends={props.setFriends} chatParamsState={props.chatParamsState} setChatParamsState={props.setChatParamsState} isFriendshipButtonClicked={props.isFriendshipButtonClicked} setIsFriendshipButtonClicked={props.setIsFriendshipButtonClicked} friendRequests={props.friendRequests} setFriendRequests={props.setFriendRequests} blockedByUsers={props.blockedByUsers}/>
		</section>
	)
}

export default Body;