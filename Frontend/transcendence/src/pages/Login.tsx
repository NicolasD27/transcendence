import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import mainTitle from '../asset/mainTitle.svg';
import gameArea from '../asset/gameArea.svg';

const Login = () => {
	const navigate = useNavigate()
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
			<img src={gameArea} className='gameArea' />
		</Fragment>
	);
};

export default Login;