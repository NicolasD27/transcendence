import React, { useState, useEffect } from "react";
import axios from "axios";
import './OptionAdmin.css';
import { json } from "stream/consumers";

interface Props {
	socket: any;
	id: number;
	activePass: boolean;
	users: userFormat[];
	moderators: userFormat[];
	userRestricted: restrictedFormat[];
}

interface userFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
}

interface restrictedFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
	bannedtype: number;
}

const OptionAdmin: React.FC<Props> = (props) => {
	//const [targets, setTargets] = React.useState(false); ARRAY PAS BOOLEAN
	const [optionSelected, setOptionSelected] = React.useState(false);

	const addAdmin = () => {
		axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/1/moderators/2`, {}, { withCredentials: true })
			.then(res => {
				console.log("Add moderator")
			})
	}

	const deleteAdmin = () => {
		axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/1/moderators/2`, { withCredentials: true })
			.then(res => {
				console.log("Delete moderator")
			})
	}

	const changeStep = () => {
		console.log("optionSelected: " + optionSelected)
		setOptionSelected(optionSelected => true);
	}

	return (
		<div className="optionArea">
			{props.id === 1 && props.activePass === false && <button className="option" onClick={changeStep}>Add password</button>}
			{props.id === 1 && props.activePass === true && <button className="option" >Remove password</button>}
			{props.id === 1 && props.activePass === true && <button className="option">Change password</button>}
			{props.id === 1 && <button className="option" onClick={addAdmin}>Add admin</button>}
			{props.id === 1 && <button className="option" onClick={deleteAdmin}>Remove admin</button>}
			<button className="option" onClick={() => props.socket.emit('ban', { userId: 2, timeout: 20, channelId: 1 })}>Ban</button>
			<button className="option" onClick={() => props.socket.emit('rescue', { userId: 2, channelId: 1 })}>Rescue</button>
			<button className="option" onClick={() => props.socket.emit('mute', { userId: 2, timeout: 30, channelId: 1 })}>Mute</button>
			<button className="option">Add to channel</button>
		</div >
	);
};

export default OptionAdmin;