import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import axios from "axios";
import './OptionAdmin.css';

interface Props {
	mode: number;
	id: number;
	users: userFormat[];
	setShowConv: Dispatch<SetStateAction<boolean>>;
	setOptionSelected: Dispatch<SetStateAction<boolean>>;
}

interface userFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
	avatar: string;
}

const ChangePassword: React.FC<Props> = (props) => {
	const [previousText, setPreviousText] = React.useState("");
	const [afterText, setAfterText] = React.useState("");

	const handleKeyPress = (event: any) => {
		if (event.key === 'Enter') {
			handleSubmitPassword(props.mode)
		}
	}

	const handleChangePrevious = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPreviousText(previousText => e.target.value)
	}

	const handleChangeAfter = (e: React.ChangeEvent<HTMLInputElement>) => {
		setAfterText(afterText => e.target.value)
	}

	const handleSubmitPassword = (value: number) => {
		const previousPassword = previousText;
		const newPassword = afterText;
		let isProtected = true;

		if (value === 2)
			isProtected = false;
		axios.put(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}`, { previousPassword: previousPassword, isProtected: isProtected, newPassword: newPassword }, { withCredentials: true })
			.then(res => { })
		setPreviousText("")
		setAfterText("")
		props.setOptionSelected(false)
		props.setShowConv(true)
	}

	return (
		<div className="passwordArea">
			<div className="textpasswordArea">
				<p className="labelStyle">Old password: </p>
				<input autoComplete='off' type="text" className="passwordInput" onChange={handleChangePrevious} value={previousText} placeholder="______" />
			</div>
			<div className="textpasswordArea">
				<p className="labelStyle">New password: </p>
				<input autoComplete='off' type="text" className="passwordInput" onChange={handleChangeAfter} value={afterText} placeholder="______" />
			</div>
			<button onClick={() => handleSubmitPassword(props.mode)} className="option">Valider</button>
		</div>
	);
};

export default ChangePassword;