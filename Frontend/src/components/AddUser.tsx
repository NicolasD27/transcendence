import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import axios from "axios";
import './OptionAdmin.css';

interface Props {
	socket: any;
	id: number;
	setShowConv: Dispatch<SetStateAction<boolean>>;
	setOptionSelected: Dispatch<SetStateAction<boolean>>;
	users: userFormat[];
}

interface userFormat {
	id: number;
	username: string;
	pseudo: string;
	avatar: string;
}

const AddUser: React.FC<Props> = (props) => {
	const [searchValue, setSearchValue] = React.useState("");
	const [searchUsers, setSearchUsers] = useState<userFormat[]>([])
	const [selectedUsers, setSelectedUsers] = useState<userFormat[]>([])

	useEffect(() => {
		if (searchValue !== "") {
			axios
				.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users?search=${searchValue}`, { withCredentials: true })
				.then((res) => {
					const users = res.data;
					setSearchUsers([])
					users.forEach((list: any) => {
						let singleUser: userFormat;
						let userTaken = false;
						let tmpavatar: string;
						if (list.avatarId != null)
							tmpavatar = `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${list.avatarId}`
						else
							tmpavatar = 'https://steamuserimages-a.akamaihd.net/ugc/907918060494216024/0BA39603DCF9F81CE0EC0384D7A35764852AD486/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false'
						singleUser = { id: list.id, username: list.username, pseudo: list.pseudo, avatar: tmpavatar };
						selectedUsers.forEach((select: any) => {
							if (singleUser.id === select.id)
								userTaken = true
						})
						props.users.forEach((select: any) => {
							if (singleUser.id === select.id)
								userTaken = true
						})
						if (userTaken === false)
							setSearchUsers(searchUsers => [...searchUsers, singleUser]);
					});
				})
				.catch((error) => console.log(error))
		}
		else
			setSearchUsers([])
	}, [searchValue, selectedUsers]) //Change selectedUsers

	const handleChangeAfter = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(searchValue => e.target.value)
		setSelectedUsers([])
	}

	const handleSubmitUser = () => {
		selectedUsers.forEach((list: any) => {
			props.socket.emit('sendInvite', { channelId: props.id, userId: list.id });
		});
		setSelectedUsers([])
		setSearchValue("")
		props.setOptionSelected(false)
		props.setShowConv(true)
	}

	const checkSelectionStatus = (user: any) => {
		if (selectedUsers.filter((friend: any) => friend.id === user.id).length === 0) {
			var newArrayAdding = [...selectedUsers, user]
			setSearchUsers([])
			setSelectedUsers(newArrayAdding)
		}
		else {
			var newArrayDeletion = selectedUsers.filter((friend: any) => friend.id !== user.id)
			setSelectedUsers(newArrayDeletion)
		}
	}

	return (
		<div className="passwordArea">
			<div className="textpasswordArea">
				<p className="labelStyle">Search user: </p>
				<input autoComplete='off' type="text" className="passwordInput" onChange={handleChangeAfter} value={searchValue} placeholder="______" />
			</div>
			<div className="userOptionArea">
				{selectedUsers
					.map((user: userFormat, i) => {
						return (
							<div className='userOption' key={i}>
								<div id='userAvatarIcon'>
									<img src={user.avatar} className="userAvatar" alt="defaultAvatar" />
								</div>
								<div className="usernameOption">{user.pseudo}</div>
								<div className='checkboxOption'>
									<input type='checkbox' name="addFriendToChannelButton" checked id={user.id.toString()} onChange={() => checkSelectionStatus(user)} />
									<label htmlFor={user.id.toString()}></label>
								</div>
							</div>
						)
					})
				}
				{searchUsers
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
			</div>
			<button onClick={() => handleSubmitUser()} className="option">Valider</button>
		</div>
	);
};

export default AddUser;