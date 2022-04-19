import React, { Fragment } from "react";
import HistoryCard from "./HistoryCard";
import './HistoryMatch.css';


const HistoryMatch = () => {
	const profileImg = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	const profileImg2 = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	const matchs = [{ avatarP: profileImg, avatarO: profileImg2, scoreP: 2, scoreO: 45 },
	{ avatarP: profileImg, avatarO: profileImg2, scoreP: 22, scoreO: 5 },
	{ avatarP: profileImg, avatarO: profileImg2, scoreP: 2, scoreO: 1 },
	{ avatarP: profileImg, avatarO: profileImg2, scoreP: 0, scoreO: 0 },
	{ avatarP: profileImg, avatarO: profileImg2, scoreP: 2, scoreO: 5 },
	{ avatarP: profileImg, avatarO: profileImg2, scoreP: 11, scoreO: 9 }];
	return (
		<Fragment>
			<div className="boxHistory">
				<div className="labelHistory">Match History:</div>
				{matchs.map((match, i) => (
					<HistoryCard key={i} avatarPlayer={match.avatarP} avatarOppenent={match.avatarO}
						scorePlayer={match.scoreP} scoreOppenent={match.scoreO} />
				))}
			</div>
		</Fragment>
	);
};

export default HistoryMatch;