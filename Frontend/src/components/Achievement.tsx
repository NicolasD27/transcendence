import React, { useState, useEffect } from "react";
import './Achievement.css';
import iconAchi from '../asset/iconAchi.svg';

interface Props {
	historys: Card[];
}

interface Card {
	winner: string;
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
				<div className={'iconAchievement ' + (succes1 ? "iconOpa" : "iconNoOpa")} ><img src={iconAchi} alt="achievementIcon"/></div>
				<div className={'iconAchievement ' + (succes2 ? "iconOpa" : "iconNoOpa")} ><img src={iconAchi} alt="achievementIcon"/></div>
				<div className={'iconAchievement ' + (succes3 ? "iconOpa" : "iconNoOpa")} ><img src={iconAchi} alt="achievementIcon"/></div>
			</div>
		</div>
	);
};

export default Achievement;