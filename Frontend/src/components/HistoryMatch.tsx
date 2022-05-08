import React, { Fragment, Component, useState, useEffect } from "react";
import { createAdd } from "typescript";
import HistoryCard from "./HistoryCard";
import './HistoryMatch.css';

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

const HistoryMatch: React.FC<Props> = (props) => {
	const { historys } = props;
	const defaultAvatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';


	return (
		<Fragment>
			<div className="boxHistory">
				<div className="labelHistory">Match History:</div>
				{historys.map((match, i) => (
					<HistoryCard key={i} namePlayer={match.nameP} nameOppenent={match.nameO} avatarPlayer={match.avatarP} avatarOppenent={match.avatarO}
						scorePlayer={match.scoreP} scoreOppenent={match.scoreO} />
				))}
			</div>
		</Fragment>
	);
};

export default HistoryMatch;