import React, { Fragment } from "react";
import './Progress-bar.css';

interface Props {
	matchs: Score[];
}

interface Score {
	scoreP: number;
	scoreO: number;
}

function calcExp(matchs: Score[]) {
	let exp = 0;
	matchs.forEach((list: any) => {
		if (list.scoreP > list.scoreO)
			exp += 35
		else
			exp += 10
	});
	return (exp)
}

const ProgressBar: React.FC<Props> = (props) => {
	const { matchs } = props;
	const ratio = calcExp(matchs)
	const level = ~~(ratio / 100);
	const exp = ratio % 100;
	return (
		<Fragment>
			<div className="containerStyle">
				<div className="fillerStyle" style={{ width: `${exp}%` }}>
					<span className="labelStyle">{`${exp}%`}</span>
				</div>
			</div >
			<div className="labelStyle">Level: {level}</div>
		</Fragment>
	);
};

export default ProgressBar;