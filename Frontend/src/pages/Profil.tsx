import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import mainTitle from '../asset/mainTitle.svg';
import gameArea from '../asset/gameArea.svg';

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
			<div className='boxNav'>
				<img src={gameArea} className='gameArea' />
				<Avatar />
				<button onClick={() => onLogout()}>Logout</button>
			</div>
		</Fragment>
	);
};

export default Profil;