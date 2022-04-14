import React, { Fragment } from "react";
import HistoryCard from "./HistoryCard";
import './HistoryMatch.css';


const HistoryMatch = () => {
	const profileImg = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg';
	return (
		<Fragment>
			<div className="boxHistory">
				<div className="labelHistory">Match History:</div>
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={400} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={54} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={400} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={54} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={400} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={54} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={400} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={54} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={400} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={54} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={4} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={400} />
				<HistoryCard avatarPlayer={profileImg} avatarOppenent={profileImg} scorePlayer={2} scoreOppenent={54} />
			</div>
		</Fragment>
	);
};

export default HistoryMatch;