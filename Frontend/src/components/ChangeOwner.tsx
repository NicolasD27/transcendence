import React, { useState, Dispatch, SetStateAction } from "react";
import axios from "axios";
import './OptionAdmin.css';

interface Props {
	id: number;
	users: userFormat[];
	moderators: userFormat[];
	setShowConv: Dispatch<SetStateAction<boolean>>;
	setOptionSelected: Dispatch<SetStateAction<boolean>>;
	activePass: boolean
}

interface userFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
	avatar: string;
}

const ChangeOwner: React.FC<Props> = (props) => {
	const [selectedUsers, setSelectedUsers] = useState<userFormat>()
	const [passwordValue, setPasswordValue] = React.useState("");

	const checkSelectionStatus = (user: any) => {
		if (selectedUsers !== undefined) {
			if (selectedUsers.id === user.id) {
				setSelectedUsers(undefined)
			}
			else {
				setSelectedUsers(user)
			}
		}
		else
			setSelectedUsers(user)
	}

	const handleSubmitUsers = () => {
		let targetmoderator = false
		if (selectedUsers !== undefined) {
			props.moderators.forEach((list: any) => {
				if (list.id === selectedUsers.id)
					targetmoderator = true
			})
			if (!targetmoderator)
				axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}/moderators/${selectedUsers.id}`, {}, { withCredentials: true })
					.then(res => { })
			axios.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}`, { userId: selectedUsers.id, password: passwordValue }, { withCredentials: true })
				.then(res => { })
		}
		props.setOptionSelected(false)
		props.setShowConv(true)
	}

	const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPasswordValue(passwordValue => e.target.value)
	}

	return (
		<div className="passwordArea">
			{props.activePass && <div className="textpasswordArea">
				<p className="labelStyle">Password: </p>
				<input autoComplete='off' type="text" className="passwordInput" onChange={handleChangePassword} value={passwordValue} placeholder="______" />
			</div>}
			<div className="userOptionArea">
				{props.users
					.map((user: userFormat, i) => {
						return (
							<div className='userOption' key={i}>
								<div id='userAvatarIcon'>
									<img src={user.avatar} className="userAvatar" alt="defaultAvatar" />
								</div>
								<div className="usernameOption">{user.pseudo}</div>
								<div className='checkboxOption'>
									<input type='radio' name="addFriendToChannelButton" id={user.id.toString()} onChange={() => checkSelectionStatus(user)} />
								</div>
							</div>
						)
					})
				}
			</div>
			{props.users.length == 0 && <p  className="labelStyle">No users</p>}
			{props.users.length > 0 && <button onClick={() => handleSubmitUsers()} className="option">Valider</button>}
		</div>
	);
};

export default ChangeOwner;