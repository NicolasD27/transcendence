import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import axios from "axios";
import './OptionAdmin.css';

interface Props {
	socket: any;
	id: number;
	setShowConv: Dispatch<SetStateAction<boolean>>;
	setOptionSelected: Dispatch<SetStateAction<boolean>>;
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
							tmpavatar = 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg'
						singleUser = { id: list.id, username: list.username, pseudo: list.pseudo, avatar: tmpavatar };
						selectedUsers.forEach((select: any) => {
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


	/*useEffect(() => {
		let searchTmp = searchUsers;
		let idTmp: number;
		selectedUsers.forEach((select: any) => {
			idTmp = 0
			searchUsers.forEach((search: any) => {
				if (select.id === search.id) {
					searchTmp = searchUsers
					idTmp = search.id
				}
			})
			if (idTmp != 0) {
				setSearchUsers([])
				searchTmp.forEach((tmp: any) => {
					if (tmp.id !== idTmp)
						setSearchUsers(searchUsers => [...searchUsers, tmp])
				})
			}
		})
	}, [selectedUsers])*/

	const handleChangeAfter = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(searchValue => e.target.value)
	}

	const handleSubmitUser = () => {
		axios.put(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels/${props.id}`, {}, { withCredentials: true })
			.then(res => { })
		setSearchValue("")
		props.setOptionSelected(false)
		props.setShowConv(true)
	}

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

	return (
		<div className="passwordArea">
			<div className="textpasswordArea">
				<p className="labelStyle">Search user: </p>
				<input autoComplete='off' type="text" className="passwordInput" onChange={handleChangeAfter} value={searchValue} placeholder="______" />
			</div>
			<div className="userOptionArea">
				{selectedUsers
					.map((user1: userFormat, i) => {
						return (
							<div className='userOption' key={i}>
								<div id='userAvatarIcon'>
									<img src={user1.avatar} className="userAvatar" alt="defaultAvatar" />
								</div>
								<div className="usernameOption">{user1.pseudo}</div>
								<div className='checkboxOption'>
									<input type='checkbox' name="addFriendToChannelButton" checked id={user1.id.toString()} onChange={() => checkSelectionStatus(user1)} />
									<label htmlFor={user1.id.toString()}></label>
								</div>
							</div>
						)
					})
				}
				{searchUsers
					.map((user2: userFormat, i) => {
						return (
							<div className='userOption' key={i}>
								<div id='userAvatarIcon'>
									<img src={user2.avatar} className="userAvatar" alt="defaultAvatar" />
								</div>
								<div className="usernameOption">{user2.pseudo}</div>
								<div className='checkboxOption'>
									<input type='checkbox' name="addFriendToChannelButton" id={user2.id.toString()} onChange={() => checkSelectionStatus(user2)} />
									<label htmlFor={user2.id.toString()}></label>
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