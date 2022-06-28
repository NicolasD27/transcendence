import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import NotificationList from '../components/NotificationList';
import './MainPage.css'
import Header from './Header'
import Body from './Body'
import { chatStateFormat } from '../App';
import { FriendsFormat } from '../App';


const MainPage = ({socket, friends, setFriends, isFriendshipButtonClicked, setIsFriendshipButtonClicked, chatParamsState, setChatParamsState, friendRequests, setFriendRequests, blockedByUsers}: {socket: any, friends : FriendsFormat[], setFriends : Dispatch<SetStateAction<FriendsFormat[]>>, isFriendshipButtonClicked: boolean, setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>, chatParamsState: chatStateFormat, setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>, friendRequests : number[], setFriendRequests : Dispatch<SetStateAction<number[]>>, blockedByUsers : number[]}) => {
	const [idMe, setIdMe] = useState(0);
	const [getIDMe, setGetIDMe] = useState(false);
	const [inPlay, setInPlay] = useState(false)

	useEffect(() => {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdMe(id_tmp.id)
			})
		setGetIDMe(getIDMe => true)
	}, [])

	return (
		<div id='bloc'>
			<Header idMe={idMe} inPlay={inPlay}/>
			<Body idMe={idMe} socket={socket} friends={friends} setFriends={setFriends} isFriendshipButtonClicked={isFriendshipButtonClicked} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} chatParamsState={chatParamsState} setChatParamsState={setChatParamsState} friendRequests={friendRequests} setFriendRequests={setFriendRequests} blockedByUsers={blockedByUsers} setInPlay={setInPlay}/>
			{getIDMe && <NotificationList myId={idMe} socket={socket} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked}/>}
		</div>
	);
};

export default MainPage;