import React, { useState, Fragment, Dispatch, SetStateAction } from "react";
import axios from "axios";
import ChangeAdmin from "./ChangeAdmin";
import './OptionAdmin.css';

interface Props {
	socket: any;
	id: number;
	activePass: boolean;
	users: userFormat[];
	moderators: userFormat[];
	userRestricted: restrictedFormat[];
	setShowConv: Dispatch<SetStateAction<boolean>>;
}

interface userFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
	avatar: string;
}

interface restrictedFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
	avatar: string;
	bannedtype: number;
}

const OptionAdmin: React.FC<Props> = (props) => {
	//const [targets, setTargets] = React.useState(false); ARRAY PAS BOOLEAN
	const [optionSelected, setOptionSelected] = React.useState(false);
	const [mode, setMode] = React.useState(0);
	const [previousText, setPreviousText] = React.useState("");
	const [afterText, setAfterText] = React.useState("");

	const changeStep = (value: number) => {
		setOptionSelected(optionSelected => true)
		setMode(value)
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
		setOptionSelected(false)
		props.setShowConv(true)
	}

	const handleKeyPress = (event: any) => {
		if (event.key === 'Enter') {
			handleSubmitPassword(mode)
		}
	}

	return (
		<Fragment>
			{optionSelected === false && <div className="optionArea">
				{props.id === 1 && props.activePass === false && <button className="option" onClick={() => changeStep(1)}>Add password</button>}
				{props.id === 1 && props.activePass === true && <button className="option" onClick={() => changeStep(2)}>Remove password</button>}
				{props.id === 1 && props.activePass === true && <button className="option" onClick={() => changeStep(3)}>Change password</button>}
				{props.id === 1 && <button className="option" /*onClick={addAdmin}*/ onClick={() => changeStep(4)}>Add admin</button>}
				{props.id === 1 && <button className="option" /*onClick={deleteAdmin}*/ onClick={() => changeStep(5)}>Remove admin</button>}
				<button className="option" onClick={() => props.socket.emit('ban', { userId: 2, timeout: 20, channelId: 1 })}>Ban</button>
				<button className="option" onClick={() => props.socket.emit('rescue', { userId: 2, channelId: 1 })}>Rescue</button>
				<button className="option" onClick={() => props.socket.emit('mute', { userId: 2, timeout: 30, channelId: 1 })}>Mute</button>
				<button className="option">Add to channel</button>
			</div >}
			{optionSelected === true && mode <= 3 && <div className="passwordArea">
				<div className="textpasswordArea">
					<p className="labelStyle">Old password: </p>
					<input autoComplete='off' type="text" className="passwordInput" onChange={handleChangePrevious} value={previousText} placeholder="______" onKeyDown={handleKeyPress} />
				</div>
				<div className="textpasswordArea">
					<p className="labelStyle">New password: </p>
					<input autoComplete='off' type="text" className="passwordInput" onChange={handleChangeAfter} value={afterText} placeholder="______" onKeyDown={handleKeyPress} />
				</div>
				<button onClick={() => handleSubmitPassword(mode)} className="option">Valider</button>
			</div>}
			{optionSelected === true && mode > 3 && <ChangeAdmin mode={mode} id={props.id} users={props.users} moderators={props.moderators} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} />}
		</Fragment>
	);
};

export default OptionAdmin;