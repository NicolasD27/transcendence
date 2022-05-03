import React, { Fragment } from "react";
import './Progress-bar.css';

interface Props {
	completed: number;
}

function calcExp(matchs: any) {
	let exp = matchs;
}

const ProgressBar: React.FC<Props> = (props) => {
	const { completed } = props;
	const level = ~~(completed / 100);
	const exp = completed % 100;
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