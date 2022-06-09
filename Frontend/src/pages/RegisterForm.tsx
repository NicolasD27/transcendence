import React, { Fragment, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { Avatar } from '../components/Avatar';
import mainTitle from '../asset/Pong-Legacy.svg';
import Pseudo from '../components/Pseudo';
import './RegisterForm.css'

const RegisterForm = () => {
	

	const [idMe, setIdMe] = useState(0);
	const [isTwoFactorEnable, setIsTwoFactorEnable] = useState(false);

	useEffect(() => {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdMe(id_tmp.id)
				setIsTwoFactorEnable(res.data.isTwoFactorEnable)
			})
		
	}, [idMe])

    const navigate = useNavigate()
	
	const onMainPage = () => {
		navigate("/mainpage")
	}


	return (
		<Fragment>
            <div className="register-container">
                <img src={mainTitle} className='mainTitle' />
                <h1>Welcome to Pong Legacy !</h1>
                <p>You can change your pseudo and avatar</p>
                {idMe != 0 && <Avatar id={idMe} idMe={idMe} />}
                {idMe != 0 && <Pseudo id={idMe} idMe={idMe}  />}
                <button onClick={onMainPage} className='ButtonStyle navButton'>Home</button>
            </div>
		</Fragment>
	);
};

export default RegisterForm;