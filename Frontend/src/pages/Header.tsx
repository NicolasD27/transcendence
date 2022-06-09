import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import mainTitle from '../asset/Pong-Legacy.svg';

interface PropsHeader {
	idMe : number;
	socket: any
}

const Header : React.FC<PropsHeader> = (props) => {
	const idMe = props.idMe;

	const navigate = useNavigate()

	const onPlay = () => {
		navigate("/mainpage")
		window.location.reload()

	}
	const onProfil = (idstring: string) => {
		navigate("/profil/" + idstring)
		window.location.reload()
	}

	const onLogout = () => {
		axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/auth/logout`, {}, { withCredentials: true })
			.then(res => {
			})
		navigate("/")
	}

	return (
			<div className='boxNav'>
				<img src={mainTitle} className='titleNav' alt="mainTitle" />
				<div><button onClick={() => onPlay()} className='ButtonStyle navButton'>Play</button></div>
				<div><button onClick={() => onProfil(idMe.toString())} className='ButtonStyle navButton'>Profile</button></div>
				<div><button onClick={() => onLogout()} className='ButtonStyle navButton'>Logout</button></div>
			</div >
		)
}

export default Header;