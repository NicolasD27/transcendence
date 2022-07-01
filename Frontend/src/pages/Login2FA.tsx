import React, { Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import './Login2FA.css';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import mainTitle from '../asset/Pong-Legacy.svg'




const Login2FA = ({ setIsAuth, setSocket }: { setIsAuth: Dispatch<SetStateAction<boolean>>, setSocket: Dispatch<SetStateAction<any>> }) => {
	const [code, setCode] = React.useState("");

	const navigate = useNavigate()

	function getAccessTokenFromCookies() {
		try {
		  const cookieString = document.cookie.split('; ').find((cookie) => cookie.startsWith('accessToken'))
		  if (cookieString)
			return ('bearer ' + cookieString.split('=')[1]);
		} catch (ex) {
		  return '';
		}
	  }

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCode(code => e.target.value)
	}

	const handleSubmit = () => {
		axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/2fa/authenticate`, { code: code }, { withCredentials: true })
			.then(res => {
				setIsAuth(true)
				setSocket(io(`http://${process.env.REACT_APP_HOST || "localhost"}:8000`, {
				reconnection: true,
				transports: ['websocket', 'polling', 'flashsocket'],
				transportOptions: {
				polling: {
					extraHeaders: {
					Authorization: getAccessTokenFromCookies()
					}
				}
				}
          }))
				navigate("/mainpage")
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



	const handleKeyPress = (event: any) => {
		if (event.key === 'Enter') {
			handleSubmit()
		}
	}



	return (
		<div className="login-wrapper">
			<div >
				<img src={mainTitle} className='mainTitle' alt="mainTitle" />

				<div id="login-container">
					<h3>Enter code from Google Authenticator</h3>
					<input autoComplete='off' type="text" id="input" onChange={handleChange} value={code} placeholder="______" onKeyDown={handleKeyPress} />
					<button onClick={handleSubmit} className="ButtonStyle navButton">Valider</button>
				</div>
			</div>
		</div>
	);

}

export default (Login2FA);