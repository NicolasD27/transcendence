import React, { Fragment} from "react";
import HistoryCard from "./HistoryCard";
import './HistoryMatch.css';

interface Props {
	historys: Card[];
}

interface Card {
	winner: string;
	nameP: string;
	nameO: string;
	pseudoP: string;
	pseudoO: string;
	avatarP: string;
	avatarO: string;
	scoreP: number;
	scoreO: number;
}

const HistoryMatch: React.FC<Props> = (props) => {
	const { historys } = props;


	return (
		<Fragment>
			<div className="boxH">
				<div className="labelHistory">Match History:</div>
				<div className="boxHistory">
					{historys.map((match, i) => (
						<HistoryCard key={i} winner={match.winner} namePlayer={match.nameP} nameOppenent={match.nameO} pseudoP={match.pseudoP} pseudoO={match.pseudoO} avatarPlayer={match.avatarP} avatarOppenent={match.avatarO}
							scorePlayer={match.scoreP} scoreOppenent={match.scoreO} />
					))}
					{historys.length === 0 && <p  className="labelStyle">No match yet</p> }
				</div>
			</div>
		</Fragment>
	);
};

export default HistoryMatch;