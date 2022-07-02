import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import NotificationList from '../components/NotificationList';
import './MainPage.css'
import Header from './Header'
import Body from './Body'
import { chatStateFormat } from '../App';
import { FriendsFormat } from '../App';


const MainPage = ({socket, matchLaunched, setMatchLaunched, friends, setFriends, isFriendshipButtonClicked, setIsFriendshipButtonClicked, chatParamsState, setChatParamsState, friendRequests, setFriendRequests, blockedByUsers, setBlockedByUsers}: {socket: any, matchLaunched: boolean, setMatchLaunched: Dispatch<SetStateAction<boolean>>, friends : FriendsFormat[], setFriends : Dispatch<SetStateAction<FriendsFormat[]>>, isFriendshipButtonClicked: boolean, setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>, chatParamsState: chatStateFormat, setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>, friendRequests : number[], setFriendRequests : Dispatch<SetStateAction<number[]>>, blockedByUsers : number[], setBlockedByUsers : Dispatch<SetStateAction<number[]>>}) => {
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

	socket.on('friendship_state_updated', () => {
		axios
			.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/blockers`, { withCredentials: true })
			.then((res) => {
				setBlockedByUsers(res.data)
			})
	})

	return (
		<div id='bloc'>
			<Header idMe={idMe} inPlay={inPlay} socket={socket}/>
			<Body idMe={idMe} socket={socket} matchLaunched={matchLaunched} setMatchLaunched={setMatchLaunched} friends={friends} setFriends={setFriends} isFriendshipButtonClicked={isFriendshipButtonClicked} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} chatParamsState={chatParamsState} setChatParamsState={setChatParamsState} friendRequests={friendRequests} setFriendRequests={setFriendRequests} blockedByUsers={blockedByUsers} setInPlay={setInPlay}/>
			{getIDMe && <NotificationList myId={idMe} socket={socket} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked}/>}
		</div>
	);
};

export default MainPage;