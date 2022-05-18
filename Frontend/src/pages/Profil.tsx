import React, { Fragment, useState } from 'react';
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

const Profil = () => {
	interface matchFormat {
		idMatch: number;
		nameP: string;
		nameO: string;
		avatarP: string;
		avatarO: string;
		scoreP: number;
		scoreO: number;
	}

	const idstring = useParams();
	console.log("idstring: " + idstring.id)
	const [id, setId] = useState(Number(idstring.id));
	console.log("ID: " + id)
	const [idMe, setIdMe] = useState(0);
	const [getIDMe, setGetIDMe] = useState(false);
	const [matchID, setMatchID] = React.useState<matchFormat[]>([]);
	const [getmatch, setGetMatch] = useState(false);

	const navigate = useNavigate()
	const onPlay = () => {
		navigate("")
	}
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
		window.location.reload()//Necessaire
	}
	const onMainPage = () => {
		navigate("/mainpage")
	}
	const onLogout = () => {
		axios.post(`http://localhost:8000/api/auth/logout`, {}, { withCredentials: true })
			.then(res => {
			})
		navigate("/")
	}

	if (getIDMe === false) {
		axios.get(`http://localhost:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdMe(id_tmp.id)
			})
		setGetIDMe(getIDMe => true)
	}

	if (getmatch === false) {
		setMatchID([])
		axios.get(`http://localhost:8000/api/users/${id}/matchs/`, { withCredentials: true })
			.then(res => {
				const matchs = res.data;
				matchs.forEach((list: any) => {
					let singleMatch: matchFormat;
					if (list.user1.id === id)
						singleMatch = { idMatch: list.id, nameP: list.user1.pseudo, nameO: list.user2.pseudo, avatarP: list.user1.avatarId, avatarO: list.user2.avatarId, scoreP: list.score1, scoreO: list.score2 };
					else
						singleMatch = { idMatch: list.id, nameP: list.user2.pseudo, nameO: list.user1.pseudo, avatarP: list.user2.avatarId, avatarO: list.user1.avatarId, scoreP: list.score2, scoreO: list.score1 };
					setMatchID(matchID => [...matchID, singleMatch]);
				});
			})
		setGetMatch(getmatch => true)
	}

	const matchTri = [...matchID].sort((a, b) => {
		return b.idMatch - a.idMatch;
	});

	return (
		<Fragment>
			<div className='boxNav'>
				<img src={mainTitle} className='titleNav' />
				<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
				<div><button onClick={() => onProfil(idMe.toString())} className='ButtonStyle navButton'>Profil</button></div>
				<div><button onClick={() => onLogout()} className='ButtonStyle navButton'>Logout</button></div>
			</div >
			<div className='boxProfil'>
				<button type='submit' style={{ backgroundImage: `url(${close})` }} onClick={() => onMainPage()} className="offProfil" />
				{id === idMe && <ToggleQRcode />}
				<Avatar id={id} idMe={idMe} setGetMatch={setGetMatch} />
				<Pseudo id={id} idMe={idMe} setGetMatch={setGetMatch} />
				<ProgressBar matchs={matchTri} />
				<div className='boxStats'>
					<HistoryMatch historys={matchTri} />
					<Achievement />
				</div>
			</div>
		</Fragment>
	);
};

export default Profil;