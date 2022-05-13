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
			<div><button  className='ButtonStyle loginButton'><a className='loginLink' href="http://localhost:8000/api/auth/42">Login</a></button></div>
		</div >
	);
}

export default Home;