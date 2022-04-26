import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Avatar } from '../components/Avatar';
import ProgressBar from '../components/Progress-bar';
import mainTitle from '../asset/mainTitle.svg';
import close from '../asset/close.svg';
import HistoryMatch from '../components/HistoryMatch';
import Achievement from '../components/Achievement';

const Profil = () => {
	interface matchFormat {
		idPlayer: string;
		idOpponent: string;
		scorePlayer: number;
		scoreOpponent: number;
	}

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
		axios.get(`http://localhost:8000/api/matchs/`, { withCredentials: true })
			.then(res => {
				const matchs = res.data;
				console.log(matchs)
				matchs.forEach((list: any) => {
					const singleMatch = { idPlayer: list.user1.username, idOpponent: list.user2.username, scorePlayer: list.score1, scoreOpponent: list.score2 };
					matchID.push(singleMatch);
					//setMatchID(matchID => [...matchID, singleMatch]);
				});
			})
		setGetMatch(getmatch => true)
	}
	console.log(matchID);

	return (
		<Fragment>
			<div className='boxNav'>
				<img src={mainTitle} className='titleNav' />
				<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
				<div><button onClick={() => onProfil()} className='ButtonStyle navButton'>Profil</button></div>
			</div >
			<div className='boxProfil'>
				<Avatar />
				<button type='submit' style={{ backgroundImage: `url(${close})` }} onClick={() => onLogout()} className="offProfil" />
				<ProgressBar completed={870} />
				<div className='boxStats'>
					<HistoryMatch completed={42} />
					<Achievement />
				</div>
			</div>
		</Fragment>
	);
};

export default Profil;