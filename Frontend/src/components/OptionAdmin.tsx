import React, { useState, Fragment, Dispatch, SetStateAction } from "react";
import axios from "axios";
import ChangePassword from "./ChangePassword";
import ChangeModerators from "./ChangeModerators";
import ChangeRestricted from "./ChangeRestricted";
import AddUser from "./AddUser";
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

	const changeStep = (value: number) => {
		setOptionSelected(optionSelected => true)
		setMode(value)
	}

	return (
		<Fragment>
			{optionSelected === false && <div className="optionArea">
				{props.id === 1 && props.activePass === false && <button className="option" onClick={() => changeStep(1)}>Add password</button>}
				{props.id === 1 && props.activePass === true && <button className="option" onClick={() => changeStep(2)}>Remove password</button>}
				{props.id === 1 && props.activePass === true && <button className="option" onClick={() => changeStep(3)}>Change password</button>}
				{props.id === 1 && <button className="option" onClick={() => changeStep(4)}>Add admin</button>}
				{props.id === 1 && <button className="option" onClick={() => changeStep(5)}>Remove admin</button>}
				<button className="option" onClick={() => changeStep(6)}>Ban</button>
				<button className="option" onClick={() => changeStep(7)}>Mute</button>
				<button className="option" onClick={() => changeStep(8)}>Rescue</button>
				<button className="option" onClick={() => changeStep(9)}>Add to channel</button>
			</div >}
			{optionSelected === true && mode <= 3 && <ChangePassword mode={mode} id={props.id} users={props.users} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} />}
			{optionSelected === true && mode >= 4 && mode <= 5 && <ChangeModerators mode={mode} id={props.id} users={props.users} moderators={props.moderators} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} />}
			{optionSelected === true && mode >= 6 && mode <= 8 && <ChangeRestricted socket={props.socket} mode={mode} id={props.id} users={props.users} userRestricted={props.userRestricted} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} />}
			{optionSelected === true && mode === 9 && <AddUser socket={props.socket} id={props.id} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} />}
		</Fragment>
	);
};

export default OptionAdmin;