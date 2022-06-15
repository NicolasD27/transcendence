import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import './OptionAdmin.css';

interface Props {
	socket: any;
	mode: number;
	id: number;
	users: userFormat[];
	userRestricted: restrictedFormat[];
	setShowConv: Dispatch<SetStateAction<boolean>>;
	setOptionSelected: Dispatch<SetStateAction<boolean>>;
	moderators: userFormat[];
}

interface restrictedFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
	avatar: string;
	bannedtype: number;
}

interface userFormat {
	id: number;
	username: string;
	pseudo: string;
	avatardId?: number;
	avatar: string;
}

const ChangeRestricted: React.FC<Props> = (props) => {
	const [filtreUsers, setFiltreUsers] = useState<userFormat[]>([])
	const [selectedUsers, setSelectedUsers] = useState<userFormat[]>([])
	const [timeRestricted, setTimeRestricted] = useState(0);


	useEffect(() => {
		setFiltreUsers([])
		if (props.mode === 6) {
			setFiltreUsers(props.users)
		}
		else if (props.mode === 7) {
			setFiltreUsers(props.users)
		}
		else if (props.mode === 8)
			setFiltreUsers(props.userRestricted)
	}, [props.mode, props.moderators, props.userRestricted, props.users]);

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
		if (props.mode === 6) {
			selectedUsers.forEach((list: any) => {
				props.socket.emit('ban', { userId: list.id, timeout: timeRestricted, channelId: props.id })
			});
		}
		else if (props.mode === 7) {
			selectedUsers.forEach((list: any) => {
				props.socket.emit('mute', { userId: list.id, timeout: timeRestricted, channelId: props.id })
			});
		}
		else if (props.mode === 8) {
			selectedUsers.forEach((list: any) => {
				props.socket.emit('rescue', { userId: list.id, channelId: props.id })
			});
		}
		setSelectedUsers([])
		props.setOptionSelected(false)
		props.setShowConv(true)
	}

	const handleChangeTime = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTimeRestricted(timeRestricted => Number(e.target.value))
	}

	const handleKeyPress = (event: any) => {
		if (event.key === 'Backspace')
			setTimeRestricted(0)
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
			{filtreUsers.length === 0 && <p className="labelStyle">No users</p>}
			{
				filtreUsers.length > 0 && props.mode !== 8 && <div className="textpasswordArea">
					<p className="labelStyle">Time: </p>
					<input autoComplete='off' type="text" className="passwordInput" onChange={handleChangeTime} value={timeRestricted} placeholder="______" onKeyDown={handleKeyPress} />
				</div>
			}
			{ }
			{filtreUsers.length > 0 && <button onClick={() => handleSubmitUsers(props.mode)} className="option">Valider</button>}
		</div>
	);
};

export default ChangeRestricted;