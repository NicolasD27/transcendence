import React, { Fragment, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { Avatar } from '../components/Avatar';
import ProgressBar from '../components/Progress-bar';
// import close from '../asset/close.svg';
import HistoryMatch from '../components/HistoryMatch';
import Achievement from '../components/Achievement';
import Pseudo from '../components/Pseudo';
import ToggleQRcode from '../components/ToggleQRcode';
import NotificationList from '../components/NotificationList';
import './MainPage.css'
import { chatStateFormat } from '../App';
import { FriendsFormat } from '../App';
import Chat from '../components/Chat';
import Header from './Header';

const Profil = ({ socket, idmeApp, friends, setFriends, isFriendshipButtonClicked, setIsFriendshipButtonClicked, chatParamsState, setChatParamsState, friendRequests, setFriendRequests, blockedByUsers }: { socket: any, idmeApp : number,  friends : FriendsFormat[], setFriends : Dispatch<SetStateAction<FriendsFormat[]>>, isFriendshipButtonClicked: boolean, setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>, chatParamsState: chatStateFormat, setChatParamsState: Dispatch<SetStateAction<chatStateFormat>>, friendRequests : number[], setFriendRequests : Dispatch<SetStateAction<number[]>>, blockedByUsers : number[] }) => {
	interface matchFormat {
		winner: string;
		idMatch: number;
		nameP: string;
		nameO: string;
		pseudoP: string;
		pseudoO: string;
		avatarP: string;
		avatarO: string;
		scoreP: number;
		scoreO: number;
	}

	const idstring = useParams();
	const [id, setId] = useState(Number(idstring.id));
	const [idMe, setIdMe] = useState(0);
	const [getIDMe, setGetIDMe] = useState(false);
	const [matchID, setMatchID] = React.useState<matchFormat[]>([]);
	const [getmatch, setGetMatch] = useState(false);
	const [isTwoFactorEnable, setIsTwoFactorEnable] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate()

	useEffect(() => {
		setId(Number(idstring.id))
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/count/`, { withCredentials: true })
		.then(res => {
			if (id > res.data|| id <= 0)
			{
				navigate("/profil/" + idmeApp);
				return;
			}
			else
			{
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${id}/`, { withCredentials: true })
			.then( res => {
				setIsLoading(false)
			})
			.catch(error => { navigate("/profil/" + idmeApp) })
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${id}/matchs/`, { withCredentials: true })
				.then(res => {
					const matchs = res.data;
					setMatchID(matchID => [])
					const matchstmp = matchs.map((list: any) => {
						let singleMatch: matchFormat;
						if (list.user1.id === id)
							singleMatch = { winner: list.winner, idMatch: list.id, nameP: list.user1.username, nameO: list.user2.username, pseudoP: list.user1.pseudo, pseudoO: list.user2.pseudo, avatarP: list.user1.avatarId, avatarO: list.user2.avatarId, scoreP: list.score1, scoreO: list.score2 };
						else
							singleMatch = { winner: list.winner, idMatch: list.id, nameP: list.user2.username, nameO: list.user1.username, pseudoP: list.user2.pseudo, pseudoO: list.user1.pseudo, avatarP: list.user2.avatarId, avatarO: list.user1.avatarId, scoreP: list.score2, scoreO: list.score1 };
						return singleMatch
					});
					const matchTri = matchstmp.sort((a, b) => {
						return b.idMatch - a.idMatch;
					});
					setMatchID(matchTri);
				}).catch(error => {})
			}
		})


		setGetMatch(true);
	}, [getmatch, idstring, id, idMe, navigate])



	if (getIDMe === false) {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdMe(id_tmp.id)
				setIsTwoFactorEnable(res.data.isTwoFactorEnable)
			}).catch(error => {})
		setGetIDMe(getIDMe => true)
	}

	const isFriend = (id: number) => {
		for (let i = 0; i < friends.length; i++) {
			if (friends[i].id === id)
				return true;
		}
		return false;
	}

	const isThereAFriendshipRequest = (id:number) => {
		for (let i = 0; i < friendRequests.length; i++)
		{
			if (friendRequests[i] === id)
				return true
		}
		return false;
	}

	const sendFriendshipRequest = (user_id: number) => {
		if (socket)
		{
			socket.emit('sendFriendRequest', {user_id: user_id})
			setFriendRequests(friendRequests => [...friendRequests, user_id])
		}
	}

	const checkStatus = (id : number) => {
		if (isThereAFriendshipRequest(id))
			return (<p className='profileFriendRequestReceived'>Pending...</p>)
		else
			return (<button className='profileSendFriendRequest' onClick={() => sendFriendshipRequest(id)}>Add Friend</button>)
	}

	if (isLoading) {
		return <div></div>
	}

	return (
		<Fragment>
			<div id='bloc'>
				<Header idMe={idMe} inPlay={false} socket={socket}/>
				<section className="gameAndChatSection">
					<div className='boxProfil' id='gameArea'>
						{id === idMe && <ToggleQRcode isTwoFactorEnable={isTwoFactorEnable} />}
						{id !== idMe && isFriend(id) === false && checkStatus(id)}
						<Avatar id={id} idMe={idMe} setGetMatch={setGetMatch} />
						<Pseudo socket={socket} id={id} idMe={idMe} setGetMatch={setGetMatch} />
						<ProgressBar matchs={matchID} />
						<div className='boxStats'>
							<HistoryMatch historys={matchID} />
							<Achievement historys={matchID} />
						</div>
					</div>
					<Chat idMe={idMe} socket={socket} friends={friends} setFriends={setFriends} chatParamsState={chatParamsState} setChatParamsState={setChatParamsState} isFriendshipButtonClicked={isFriendshipButtonClicked} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} friendRequests={friendRequests} setFriendRequests={setFriendRequests} blockedByUsers={blockedByUsers}/>
				</section>
				{getIDMe && <NotificationList myId={idMe} socket={socket} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} />}
			</div>
		</Fragment>
	);
};

export default Profil;