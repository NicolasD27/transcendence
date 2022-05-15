import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import mainTitle from '../asset/Pong-Legacy.svg';
import searchIcon from '../asset/searchIcon.svg';
import addGroupIcon from "../asset/addGroupIcon.svg"
import { Match } from '../components/Match'
import { cp } from 'fs/promises';

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

const Login = () => {
	const navigate = useNavigate()
	const onPlay = () => {
		navigate("")
	}
	const onProfil = (id: number, idMe: number) => {
		navigate("/profil", { state: { id, idMe } })
	}
	const [idPerso, setIdPerso] = useState(0);
	const [getID, setGetID] = useState(false);

	if (getID === false) {
		axios.get(`http://localhost:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdPerso(id_tmp.id)
			})
		setGetID(getID => true)
	}
	return (
		<Fragment>
			<div id='bloc'>
				<div className='boxNav'>
					<img src={mainTitle} className='titleNav' alt="mainTitle" />
					<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
					<div><button onClick={() => onProfil(idPerso, idPerso)} className='ButtonStyle navButton'>Profil</button></div>
				</div >
				<section id="gameAndChatSection">
					<div className='gameArea' id='gameArea'></div>
					<Match/ >
					<Chat/>
				</section>
			</div>
		</Fragment>
	);
};

//ajouterdans la gamearea des boutons pour le match making

export default Login;