import React, { Component, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import './Login2FA.css';
import { useNavigate } from 'react-router-dom';

import mainTitle from '../asset/Pong-Legacy.svg'

	


const Login2FA = ({setIsAuth} : {setIsAuth: Dispatch<SetStateAction<boolean>>}) => {
	const [code, setCode] = React.useState("");
	const [QRcode, setQRcode] = React.useState<Blob>();
	const [isMounted, setIsMouted] = React.useState(false);
	const navigate = useNavigate()
	


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(code => e.target.value)
    }

    const handleSubmit = () => {
        axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/2fa/authenticate`, {code: code}, {withCredentials: true	})
			.then(res => {
				setIsAuth(true)
				navigate("/login")

			})
			.catch(err => {
				const input = document.getElementById("input");
				if (input) {
					input.classList.add('error');
					setTimeout(function () {
						input.classList.remove('error');
						setCode("")
					}, 300);
				}
				
			})
    }

	if (!isMounted) {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/2fa/generate-qr`, {withCredentials: true, responseType: 'blob'	})
		.then(res => {
			console.log(res)
			setQRcode(QRcode => res.data)
			setIsMouted(isMounted => true)
		})
	}

	const handleKeyPress = (event: any) => {
		if(event.key === 'Enter'){
			handleSubmit()
		}
	  }
	

	
	return (
		<div className="login-wrapper">
			<div >
				<img src={mainTitle} className='mainTitle' alt="mainTitle"/>
				{QRcode && <img src={URL.createObjectURL(QRcode)} className="qrcode"/>}
				<p className='login-title'>Scan with Google Authenticator</p>
				<div id="login-container">
					
					<input autoComplete='off' type="text" id="input" onChange={handleChange} value={code} placeholder="______" onKeyDown={handleKeyPress}/>
					<button onClick={handleSubmit} className="ButtonStyle navButton">Valider</button>
				</div>
			</div>
		</div>
	);
	
}

export default (Login2FA);