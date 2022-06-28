import React from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import mainTitle from '../asset/Pong-Legacy.svg';
import profileIcon from '../asset/profileIcon2.svg';
import logoutIcon from '../asset/logoutIcon4.svg';
import './Header.css'



interface PropsHeader {
	idMe: number;
	inPlay: boolean
}

const Header: React.FC<PropsHeader> = (props) => {
	const idMe = props.idMe;

	const navigate = useNavigate()

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

	const goToMainPage = () => {
		navigate("/mainpage")
		window.location.reload()
	}

	return (
		<div className='boxNav'>
			<div>

				<img src={mainTitle} className='titleNav' alt="mainTitle" onClick={goToMainPage} />
			</div>
			<div className='header-right'>
				{props.inPlay === false && <img onClick={() => onProfil(idMe.toString())} src={profileIcon} className='profileIcon' alt="profileIcon" />}
				<img onClick={() => onLogout()} src={logoutIcon} className='logoutIcon' alt="logoutIcon" />
			</div>
		</div >
	)
}

export default Header;