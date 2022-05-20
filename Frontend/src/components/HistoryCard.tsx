import React, { Fragment } from "react";
import './HistoryCard.css';

interface Props {
	namePlayer: string;
	nameOppenent: string;
	avatarPlayer: string;
	avatarOppenent: string;
	scorePlayer: number;
	scoreOppenent: number;
}

const HistoryCard: React.FC<Props> = (props) => {
	const idP = props.avatarPlayer;
	const idO = props.avatarOppenent;
	const scorePlayer = props.scorePlayer;
	const scoreOppenent = props.scoreOppenent;
	let avatarPlayer: string;
	let avatarOppenent: string;

	if (idP != null)
		avatarPlayer = `http://${process.env.REACT_APP_HOST || "localhost"}/api/database-files/${idP}`
	else
		avatarPlayer = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg'
	if (idO != null)
		avatarOppenent = `http://${process.env.REACT_APP_HOST || "localhost"}/api/database-files/${idO}`
	else
		avatarOppenent = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg'

	return (
		<div className="boxCard">
			<div>
				<img src={avatarPlayer} alt="" id="img" className="imgCard" />
				<div className="nameStyle">{props.namePlayer}</div>
			</div>
			<div className="scoreStyle">{scorePlayer}  -  {scoreOppenent}</div>
			<div>
				<img src={avatarOppenent} alt="" id="img" className="imgCard" />
				<div className="nameStyle">{props.nameOppenent}</div>
			</div>
		</div >
	);
};

export default HistoryCard;