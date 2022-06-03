import React, { Dispatch, SetStateAction } from "react";
import './ShowOptionAdmin.css';

interface Props {
	showConv: boolean;
	setShowConv: Dispatch<SetStateAction<boolean>>;
}

const ShowOptionAdmin: React.FC<Props> = (props) => {

	return (
		<div>
			{props.showConv === true && <button className="OptionAdmindButton" onClick={() => props.setShowConv(false)} />}
			{props.showConv === false && <button className="CancelButton" onClick={() => props.setShowConv(true)} />}
		</div >
	);
};

export default ShowOptionAdmin;