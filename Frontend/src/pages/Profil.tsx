import React, { Fragment, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import './MainPage.css'
import { chatStateFormat } from '../App';
import Chat from '../components/Chat';
import Header from './Header';

const Profil = ({ socket, isFriendshipButtonClicked, setIsFriendshipButtonClicked, chatParamsState, setChatParamsState }: { socket: any, isFriendshipButtonClicked: boolean, setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>, chatParamsState: chatStateFormat, setChatParamsState: Dispatch<SetStateAction<chatStateFormat>> }) => {
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

	return (
		<Fragment>
			<div id='bloc'>
				<Header idMe={idMe} />
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
					<Chat idMe={idMe} socket={socket} chatParamsState={chatParamsState} setChatParamsState={setChatParamsState} isFriendshipButtonClicked={isFriendshipButtonClicked} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked}/>
				</section>
				{getIDMe && <NotificationList myId={idMe} socket={socket} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} />}
			</div>
		</Fragment>
	);
};

export default Profil;