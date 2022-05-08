import React, { Fragment, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Avatar } from '../components/Avatar';
import ProgressBar from '../components/Progress-bar';
import mainTitle from '../asset/mainTitle.svg';
import close from '../asset/close.svg';
import HistoryMatch from '../components/HistoryMatch';
import Achievement from '../components/Achievement';

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
	const onProfil = () => {
		navigate("/profil")
	}

	if (getmatch === false) {
		axios.get(`http://localhost:8000/api/users/${state.id}/matchs/`, { withCredentials: true })
			.then(res => {
				const matchs = res.data;
				matchs.forEach((list: any) => {
					let singleMatch: matchFormat;
					if (list.user1.id == state.id)
						singleMatch = { idMatch: list.id, nameP: list.user1.username, nameO: list.user2.username, avatarP: list.user1.avatarId, avatarO: list.user2.avatarId, scoreP: list.score1, scoreO: list.score2 };
					else
						singleMatch = { idMatch: list.id, nameP: list.user2.username, nameO: list.user1.username, avatarP: list.user2.avatarId, avatarO: list.user1.avatarId, scoreP: list.score2, scoreO: list.score1 };
					//matchID.push(singleMatch);
					setMatchID(matchID => [...matchID, singleMatch]);
				});
				//matchID.sort((a, b) => a.scoreP - b.scoreP)
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
				<div><button onClick={() => onProfil()} className='ButtonStyle navButton'>Profil</button></div>
			</div >
			<div className='boxProfil'>
				<Avatar id={state.id} idMe={state.idMe} />
				<button type='submit' style={{ backgroundImage: `url(${close})` }} onClick={() => onLogout()} className="offProfil" />
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