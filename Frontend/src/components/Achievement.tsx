import React, { Fragment, useState, useEffect } from "react";
import './Achievement.css';
import iconAchi from '../asset/iconAchi.svg';

interface Props {
	historys: Card[];
}

interface Card {
	nameP: string;
	nameO: string;
	avatarP: string;
	avatarO: string;
	scoreP: number;
	scoreO: number;
}

const Achievement: React.FC<Props> = (props) => {
	const { historys } = props;
	const [succes1, setSucces1] = useState(false);
	const [succes2, setSucces2] = useState(false);
	const [succes3, setSucces3] = useState(true);
	const [getSucces, setGetSucces] = useState(false);
	//Ca marche pas
	useEffect(() => {
		if (historys.length > 0)
			setSucces1(true);
		else
			setSucces3(false);
		historys.forEach((list: any) => {
			if (list.scoreP > list.scoreO)
				setSucces2(true);
			if (list.scoreO > list.scoreP)
				setSucces3(false);
		})
	}, [historys])

	return (
		<div className="boxA">
			<div className="labelAchievement">Achievements:</div>
			<div className="boxAchievement">
				{succes1 === true && <div className='iconAchievement' style={{ opacity: 1 }}><img src={iconAchi} /></div>}
				{succes1 === false && <div className='iconAchievement' style={{ opacity: 0.4 }}><img src={iconAchi} /></div>}
				{succes2 === true && <div className='iconAchievement' style={{ opacity: 1 }}><img src={iconAchi} /></div>}
				{succes2 === false && <div className='iconAchievement' style={{ opacity: 0.4 }}><img src={iconAchi} /></div>}
				{succes3 === true && <div className='iconAchievement' style={{ opacity: 1 }}><img src={iconAchi} /></div>}
				{succes3 === false && <div className='iconAchievement' style={{ opacity: 0.4 }}><img src={iconAchi} /></div>}
			</div>
		</div>
	);
};

export default Achievement;