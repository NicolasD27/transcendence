import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import axios from "axios";
import './OptionAdmin.css';

interface Props {
	mode: number;
	id: number;
	users: userFormat[];
	moderators: userFormat[];
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

const ChangeModerators: React.FC<Props> = (props) => {
	const [filtreUsers, setFiltreUsers] = useState<userFormat[]>([])
	const [selectedUsers, setSelectedUsers] = useState<userFormat[]>([])


	useEffect(() => {
		setFiltreUsers([])
		if (props.mode === 4) {
			props.users.forEach((list: any) => {
				let addUser = true
				props.moderators.forEach((moderator: any) => {
					if (list.id === moderator.id)
						addUser = false
				})
				if (addUser === true)
					setFiltreUsers(filtreUsers => [...filtreUsers, list])
			});
		}
		else if (props.mode === 5)
			setFiltreUsers(props.moderators)
	}, []);

	const checkSelectionStatus = (user: any) => {
		if (selectedUsers.filter((friend: any) => friend.id === user.id).length === 0) {
			var newArrayAdding = [...selectedUsers, user]
			setSelectedUsers(newArrayAdding)
		}
		else {
			var newArrayDeletion = selectedUsers.filter((friend: any) => friend.id !== user.id)
			setSelectedUsers(newArrayDeletion)
		}
	}

	const handleSubmitUsers = (value: number) => {
		if (props.mode === 4) {
			filtreUsers.forEach((list: any) => {
				axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}/moderators/${list.id}`, {}, { withCredentials: true })
					.then(res => { })
			});
		}
		else if (props.mode === 5) {
			selectedUsers.forEach((list: any) => {
				axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}/moderators/${list.id}`, { withCredentials: true })
					.then(res => { })
			});
		}
		props.setOptionSelected(false)
		props.setShowConv(true)
	}

	return (
		<div className="userOptionArea">
			{filtreUsers
				.map((user: userFormat, i) => {
					return (
						<div className='userOption' key={i}>
							<div id='userAvatarIcon'>
								<img src={user.avatar} className="userAvatar" alt="defaultAvatar" />
							</div>
							<div className="usernameOption">{user.pseudo}</div>
							<div className='checkboxOption'>
								<input type='checkbox' name="addFriendToChannelButton" id={user.id.toString()} onChange={() => checkSelectionStatus(user)} />
								<label htmlFor={user.id.toString()}></label>
							</div>
						</div>
					)
				})
			}
			<button onClick={() => handleSubmitUsers(props.mode)} className="option">Valider</button>
		</div>
	);
};

export default ChangeModerators;