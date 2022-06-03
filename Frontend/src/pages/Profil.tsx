import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { Avatar } from '../components/Avatar';
import ProgressBar from '../components/Progress-bar';
import mainTitle from '../asset/Pong-Legacy.svg';
import close from '../asset/close.svg';
import HistoryMatch from '../components/HistoryMatch';
import Achievement from '../components/Achievement';
import Pseudo from '../components/Pseudo';
import ToggleQRcode from '../components/ToggleQRcode';
import NotificationList from '../components/NotificationList';
import { Socket } from 'socket.io-client';
import './MainPage.css'
import Message from '../components/Message';//!TEST!
import Conversation from '../components/Conversation';//!TEST!

const Profil = ({ socket }: { socket: any }) => {
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

	useEffect(() => {
		setId(Number(idstring.id))
	}, [Number(idstring.id)])

	useEffect(() => {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${id}/matchs/`, { withCredentials: true })
			.then(res => {
				const matchs = res.data;
				setMatchID(matchID => [])
				matchs.forEach((list: any) => {
					let singleMatch: matchFormat;
					if (list.user1.id === id)
						singleMatch = { winner: list.winner, idMatch: list.id, nameP: list.user1.username, nameO: list.user2.username, pseudoP: list.user1.pseudo, pseudoO: list.user2.pseudo, avatarP: list.user1.avatarId, avatarO: list.user2.avatarId, scoreP: list.score1, scoreO: list.score2 };
					else
						singleMatch = { winner: list.winner, idMatch: list.id, nameP: list.user2.username, nameO: list.user1.username, pseudoP: list.user2.pseudo, pseudoO: list.user1.pseudo, avatarP: list.user2.avatarId, avatarO: list.user1.avatarId, scoreP: list.score2, scoreO: list.score1 };
					setMatchID(matchID => [...matchID, singleMatch]);
				});
			})
		const matchTri = [...matchID].sort((a, b) => {
			return b.idMatch - a.idMatch;
		});
		setMatchID(matchTri);
		setGetMatch(true);
	}, [getmatch])


	const navigate = useNavigate()
	const onPlay = () => {
		navigate("/mainpage")
		window.location.reload()
	}
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
		window.location.reload()
	}
	const onMainPage = () => {
		navigate("/mainpage")
	}
	const onLogout = () => {
		axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/auth/logout`, {}, { withCredentials: true })
			.then(res => {
			})
		navigate("/")
	}

	if (getIDMe === false) {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdMe(id_tmp.id)
				setIsTwoFactorEnable(res.data.isTwoFactorEnable)
			})
		setGetIDMe(getIDMe => true)
	}

	/*useEffect(() => {
		const matchTri = [...matchID].sort((a, b) => {
			return b.idMatch - a.idMatch;
		});
		setMatchID(matchTri)
	}, [matchID.length])*/

	return (
		<Fragment>
			<div id='bloc'>
				<div className='boxNav'>
					<img src={mainTitle} className='titleNav' onClick={() => onMainPage()} />
					<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
					<div><button onClick={() => onProfil(idMe.toString())} className='ButtonStyle navButton'>Profil</button></div>
					<div><button onClick={() => onLogout()} className='ButtonStyle navButton'>Logout</button></div>
				</div >
				<section id="gameAndChatSection">
					<div className='boxProfil'>
						<button type='submit' style={{ backgroundImage: `url(${close})` }} onClick={() => onMainPage()} className="offProfil" />
						{id === idMe && <ToggleQRcode isTwoFactorEnable={isTwoFactorEnable} />}
						<Avatar id={id} idMe={idMe} setGetMatch={setGetMatch} />
						<Pseudo id={id} idMe={idMe} setGetMatch={setGetMatch} />
						<ProgressBar matchs={matchID} />
						<div className='boxStats'>
							<HistoryMatch historys={matchID} />
							<Achievement historys={matchID} />
						</div>
					</div>
					{/*idMe > 0 && <Conversation idMe={idMe} id={1} type={'channel'} nameChat={"string2"} socket={socket} />*/}
				</section>
				{getIDMe && <NotificationList myId={idMe} socket={socket} />}
			</div>
		</Fragment>
	);
};

export default Profil;