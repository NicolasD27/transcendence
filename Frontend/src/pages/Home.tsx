import React from 'react';
import { useNavigate } from 'react-router-dom';
import mainTitle from '../asset/Pong-Legacy.svg'

const Home = () => {
	const navigate = useNavigate()
	const onMainPage = () => {
		navigate("mainpage")
	}
	return (
		<div className='box'>
			<img src={mainTitle} className='mainTitle' />
			<h2 className='subtitleStyle'>Play fun</h2>
			<div><button onClick={() => onMainPage()} className='ButtonStyle loginButton'>Login</button></div>
		</div >
	);
}

export default Home;