import React from 'react';
import { useNavigate } from 'react-router-dom';
import mainTitle from '../asset/mainTitle.svg'

const Home = () => {
	const navigate = useNavigate()
	const onLogin = () => {
		navigate("login")
	}
	return (
		<div className='box'>
			<img src={mainTitle} className='mainTitle' />
			<h2 className='subtitleStyle'>Play fun</h2>
			<div><button onClick={() => onLogin()} className='ButtonStyle loginButton'>Login</button></div>
		</div >
	);
}

export default Home;