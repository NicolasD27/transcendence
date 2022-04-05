import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import mainTitle from '../asset/mainTitle.svg';
//import gameArea from '../asset/gameArea.svg';

const Chat = () => {
	return (
		<div className='chatArea'></div>
	)
}

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
			<div id='bloc'>
				<div className='boxNav'>
					<img src={mainTitle} className='titleNav' alt="mainTitle"/>
					<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
					<div><button onClick={() => onProfil()} className='ButtonStyle navButton'>Profil</button></div>
				</div >
				<section>
					<div className='gameArea'></div>
					<Chat/>
				</section>
			</div>
		</Fragment>
	);
};

export default Login;