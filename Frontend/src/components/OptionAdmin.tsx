import React, { Fragment, Dispatch, SetStateAction } from "react";
import axios from "axios";
import ChangePassword from "./ChangePassword";
import ChangeModerators from "./ChangeModerators";
import ChangeRestricted from "./ChangeRestricted";
import AddUser from "./AddUser";
import ChangeOwner from "./ChangeOwner";
import { chatStateFormat } from '../App';
import './OptionAdmin.css';

interface Props {
	idMe: number;
	nameChat: string;
	adminLevel: number;
	socket: any;
	id: number;
	activePass: boolean;
	activePrivate: boolean;
	users: userFormat[];
	moderators: userFormat[];
	userRestricted: restrictedFormat[];
	setShowConv: Dispatch<SetStateAction<boolean>>;
	setChatState: Dispatch<SetStateAction<chatStateFormat>>;
	setRecupList: Dispatch<SetStateAction<boolean>>;
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
	const [optionSelected, setOptionSelected] = React.useState(false);
	const [mode, setMode] = React.useState(0);

	const changeStep = (value: number) => {
		setOptionSelected(optionSelected => true)
		setMode(value)
	}

	const leaveChannel = () => {
		axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}/leave`, { withCredentials: true })
			.then(res => { props.setRecupList(true) 
				props.socket.emit('leave_channel', { channelId: props.id.toString() });})
		props.setChatState({ 'chatState': false, id: 0, chatName: "", chatPseudo: "", type: "directM" })
		props.setShowConv(true)
	}

	return (
		<Fragment>
			{optionSelected === false && <div className="optionArea">
				{props.adminLevel === 1 && props.activePass === false && props.activePrivate === false && <button className="option" onClick={() => changeStep(1)}>Add password</button>}
				{props.adminLevel === 1 && props.activePass === true && <button className="option" onClick={() => changeStep(2)}>Remove password</button>}
				{props.adminLevel === 1 && props.activePass === true && <button className="option" onClick={() => changeStep(3)}>Change password</button>}
				{props.adminLevel === 1 && <button className="option" onClick={() => changeStep(4)}>Add admin</button>}
				{props.adminLevel === 1 && <button className="option" onClick={() => changeStep(5)}>Remove admin</button>}
				{props.adminLevel > 0 && <button className="option" onClick={() => changeStep(6)}>Ban</button>}
				{props.adminLevel > 0 && <button className="option" onClick={() => changeStep(7)}>Mute</button>}
				{props.adminLevel > 0 && <button className="option" onClick={() => changeStep(8)}>Rescue</button>}
				{props.adminLevel > 0 && <button className="option" onClick={() => changeStep(9)}>Add to channel</button>}
				{props.adminLevel === 1 && <button className="option" onClick={() => changeStep(10)}>Change Owner</button>}
				{<button className="option" onClick={() => leaveChannel()}>Leave Channel</button>}
			</div >}
			{optionSelected === true && mode <= 3 && <ChangePassword mode={mode} id={props.id} users={props.users} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} activePass={props.activePass} />}
			{optionSelected === true && mode >= 4 && mode <= 5 && <ChangeModerators mode={mode} id={props.id} users={props.users} moderators={props.moderators} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} />}
			{optionSelected === true && mode >= 6 && mode <= 8 && <ChangeRestricted socket={props.socket} mode={mode} id={props.id} users={props.users} moderators={props.moderators} userRestricted={props.userRestricted} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} />}
			{optionSelected === true && mode === 9 && <AddUser socket={props.socket} id={props.id} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} users={props.users} />}
			{optionSelected === true && mode === 10 && <ChangeOwner id={props.id} users={props.users} moderators={props.moderators} setShowConv={props.setShowConv} setOptionSelected={setOptionSelected} activePass={props.activePass} />}
		</Fragment>
	);
};

export default OptionAdmin;