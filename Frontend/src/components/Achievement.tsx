import React, { Fragment } from "react";
import './Achievement.css';
import iconAchi from '../asset/iconAchi.svg';

const Achievement = () => {
	return (
		<div className="boxA">
			<div className="labelAchievement">Achievements:</div>
			<div className="boxAchievement">
				<div className='iconAchievement'><img src={iconAchi} /></div>
				<div className='iconAchievement'><img src={iconAchi} /></div>
				<div className='iconAchievement'><img src={iconAchi} /></div>
			</div>
		</div>
	);
};

export default Achievement;