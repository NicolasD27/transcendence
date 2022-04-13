import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import ProgressBar from '../components/Progress-bar';
import mainTitle from '../asset/mainTitle.svg';
import close from '../asset/close.svg';
import HistoryMatch from '../components/HistoryMatch';

const Profil = () => {
	const navigate = useNavigate()
	const onLogout = () => {
		navigate("/")
	}
	const onPlay = () => {
		navigate("")
	}
	const onProfil = () => {
		navigate("/profil")
	}
	return (
		<Fragment>
			<div className='boxNav'>
				<img src={mainTitle} className='titleNav' />
				<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
				<div><button onClick={() => onProfil()} className='ButtonStyle navButton'>Profil</button></div>
			</div >
			<div className='boxProfil'>
				<Avatar />
				<button type='submit' style={{ backgroundImage: `url(${close})` }} onClick={() => onLogout()} className="offProfil">
					<img src={close} alt="submit" className="offImg" />
				</button>
				<ProgressBar completed={870} />
				<div className='boxStats'>
					<HistoryMatch />
					<HistoryMatch />
				</div>
			</div>
		</Fragment>
	);
};

export default Profil;