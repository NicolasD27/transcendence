import React, { Fragment } from "react";
import './HistoryCard.css';

interface Props {
	avatarPlayer: string;
	avatarOppenent: string;
	scorePlayer: number;
	scoreOppenent: number;
}

const HistoryCard: React.FC<Props> = (props) => {
	const avatarPlayer = props.avatarPlayer;
	const avatarOppenent = props.avatarOppenent;
	const scorePlayer = props.scorePlayer;
	const scoreOppenent = props.scoreOppenent;
	return (
		<div className="boxCard">
			<img src={avatarPlayer} alt="" id="img" className="imgCard" />
			<div className="scoreStyle">{scorePlayer}  -  {scoreOppenent}</div>
			<img src={avatarOppenent} alt="" id="img" className="imgCard" />
		</div>
	);
};

export default HistoryCard;