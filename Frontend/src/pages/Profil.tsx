import React, { Fragment, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Avatar } from '../components/Avatar';
import ProgressBar from '../components/Progress-bar';
import mainTitle from '../asset/Pong-Legacy.svg';
import close from '../asset/close.svg';
import HistoryMatch from '../components/HistoryMatch';
import Achievement from '../components/Achievement';
import Pseudo from '../components/Pseudo';

const Profil = ({isAuth}: {isAuth: boolean}) => {
	interface matchFormat {
		idMatch: number;
		nameP: string;
		nameO: string;
		avatarP: string;
		avatarO: string;
		scoreP: number;
		scoreO: number;
	}

	interface StateType {
		id: number;
		idMe: number;
	}

	const location = useLocation();
	const state = location.state as StateType
	//console.log("ID: " + props.props.id)
	const [matchID, setMatchID] = React.useState<matchFormat[]>([]);
	const [getmatch, setGetMatch] = useState(false);
	const navigate = useNavigate()
	const onLogout = () => {
		navigate("/login")
	}
	const onPlay = () => {
		navigate("")
	}
	const onProfil = (id: number, idMe: number) => {
		navigate("/profil", { state: { id, idMe } })
		window.location.reload()
	}

	if (getmatch === false) {
		setMatchID([])
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${state.id}/matchs/`, { withCredentials: true })
			.then(res => {
				const matchs = res.data;
				matchs.forEach((list: any) => {
					let singleMatch: matchFormat;
					if (list.user1.id === state.id)
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
				<div><button onClick={() => onProfil(state.idMe, state.idMe)} className='ButtonStyle navButton'>Profil</button></div>
			</div >
			<div className='boxProfil'>
				<button type='submit' style={{ backgroundImage: `url(${close})` }} onClick={() => onLogout()} className="offProfil" />
				<input className="switch" type="checkbox" />
				<Avatar id={state.id} idMe={state.idMe} setGetMatch={setGetMatch} />
				<Pseudo id={state.id} idMe={state.idMe} setGetMatch={setGetMatch} />
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