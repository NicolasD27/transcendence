import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import mainTitle from '../asset/mainTitle.svg';
import searchIcon from '../asset/searchIcon.svg';
import addGroupIcon from "../asset/addGroupIcon.svg"
import { Match } from '../components/Match'

const Chat = () => {
	return (
		<div className='chatArea'>
			<div className="searchAndAdd">
				<div id="searchBar">
					<img src={searchIcon} alt="searchIcon" id='searchIcon'/>
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
		navigate("") //I put it for now in gameAndChatSection, maybe going to move it
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
				<section id="gameAndChatSection">
					<div className='gameArea' id='gameArea'></div>
						<Match/ >
					<Chat/>
				</section>
			</div>
		</Fragment>
	);
};


export default Login;