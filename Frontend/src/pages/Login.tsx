import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import mainTitle from '../asset/Pong-Legacy.svg';
import searchIcon from '../asset/searchIcon.svg';
import addGroupIcon from "../asset/addGroupIcon.svg"
import { Match } from '../components/Match'
import { cp } from 'fs/promises';
import NotificationList from '../components/NotificationList';
//import gameArea from '../asset/gameArea.svg';

const Chat = () => {
	return (
		<div className='chatArea'>
			<div className="searchAndAdd">
				<div id="searchBar">
					<img src={searchIcon} alt="searchIcon" id='searchIcon' />
					<input type='text' placeholder='Search...' name='search' id='searchFriend'></input>
				</div>
				<button id='addGroup'></button>
			</div>
		</div>
	)
}

const Login = ({isAuth}: {isAuth: boolean}) => {
	const [idMe, setIdMe] = useState(0);
	const [getIDMe, setGetIDMe] = useState(false);

	const navigate = useNavigate()
	const onPlay = () => {
		navigate("")
	}
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
	}
	const onLogout = () => {
		axios.post(`http://localhost:8000/api/auth/logout`, {}, { withCredentials: true })
			.then(res => {
			})
		navigate("/")
	}

	if (getIDMe === false) {
		axios.get(`http://localhost:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdMe(id_tmp.id)
			})
		setGetIDMe(getIDMe => true)
	}
	return (
		<Fragment>
			<div id='bloc'>
				<div className='boxNav'>
					<img src={mainTitle} className='titleNav' alt="mainTitle" />
					<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
					<div><button onClick={() => onProfil(idMe.toString())} className='ButtonStyle navButton'>Profil</button></div>
					<div><button onClick={() => onLogout()} className='ButtonStyle navButton'>Logout</button></div>
				</div >
				<section id="gameAndChatSection">
					<div className='gameArea' id='gameArea'></div>
					<Match/ >
					<Chat/>
				</section>
			</div>
			{getIDMe && <NotificationList myId={idMe} />}
		</Fragment>
	);
};

export default Login;