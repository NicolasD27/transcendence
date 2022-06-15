import React, { useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios'
import PrintChannelCreationSettings from './PrintChannelCreationSettings'
import PrintFriendToAddChannel from './PrintFriendToAddChannel'
import searchIcon from '../asset/searchIcon.svg'
import { FriendsFormat } from './Chat'
import { chatStateFormat } from '../App'

interface PropsSearchBarAddGroup {
	idMe: number;
	setSearchValue: Dispatch<SetStateAction<string>>
	friends: FriendsFormat[];
	createChannelButtonState: boolean;
	setCreateChannelButtonState: Dispatch<SetStateAction<boolean>>;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
}

const SearchBarAddGroup: React.FC<PropsSearchBarAddGroup> = (props) => {

	const [selectedFriend, setSelectedFriend] = useState<FriendsFormat[]>([])
	const [isNextButtonClicked, setIsNextButtonClicked] = useState(false)
	const [channelVisibilitySelected, setChannelVisibilitySelected] = useState("public")
	const [channelNameEntered, setChannelNameEntered] = useState("")
	const [passwordEntered, setPasswordEntered] = useState("")
	const [isPrivate, setIsPrivate] = useState(false)
	const [isProtected, setIsProtected] = useState(false)

	const handleSearchRequest = (e: any) => {
		props.setSearchValue("")
		let value = e.target.value
		props.setSearchValue(value)
	}

	const handleClick = () => {
		props.setCreateChannelButtonState(!props.createChannelButtonState)
	}

	const createChannel = () => {
		let tmpPrivate = false
		let tmpProtected = false
		if (channelVisibilitySelected === "private")
			tmpPrivate = true
		else if (channelVisibilitySelected === "protected")
			tmpProtected = true

		console.log("password entered:", passwordEntered)
		if (channelVisibilitySelected === "protected")
			axios
				.post(`http://localhost:8000/api/channels`, {
					"name": channelNameEntered,
					"isPrivate": tmpPrivate,
					"isProtected": tmpProtected,
					"password": passwordEntered
				}, { withCredentials: true })
				.then((response) => {
					props.setChatParamsState({ 'chatState': true, id: response.data.id, chatName: channelNameEntered, type: "channel" })

					/*if (response.data.message === "This channel name is already taken.")
					{
						channelName.classList.add('error');
						setTimeout(function () {
							channelName.classList.remove('error');
						}, 300);
					}*/
				})
				.catch((err) => console.log(err.data))
		else
			axios
				.post(`http://localhost:8000/api/channels`, {
					"name": channelNameEntered,
					"isPrivate": tmpPrivate,
					"isProtected": tmpProtected
				}, { withCredentials: true })
				.then((response) => {
					props.setChatParamsState({ 'chatState': true, id: response.data.id, chatName: channelNameEntered, type: "channel" })
				})
				.catch((err) => console.log(err.data))
	}


	return (
		<>
			<div className="searchAndAdd">
				<div id="searchBar">
					<img src={searchIcon} alt="searchIcon" id='searchIcon' />
					<input type='text' placeholder='Search...' name='searchFriend' id='searchFriend' onChange={handleSearchRequest} />
				</div>
				<button id='addGroup' onClick={handleClick} />
			</div>
			{
				props.createChannelButtonState &&
				<>
					{
						isNextButtonClicked &&
						<>
							<div className='channelCreationSettings'>
								<PrintChannelCreationSettings setIsNextButtonClicked={setIsNextButtonClicked} setChannelVisibilitySelected={setChannelVisibilitySelected} setChannelNameEntered={setChannelNameEntered} passwordEntered={passwordEntered} setPasswordEntered={setPasswordEntered} />
							</div>
							<button id="checkbox_previousChannelButton" type="button" onClick={() => setIsNextButtonClicked(!isNextButtonClicked)}>Previous</button>
							<button id="checkbox_createChannelButton" formMethod='post' type="button" onClick={createChannel}>Create Channel</button>
						</>
					}
					{
						!isNextButtonClicked &&
						<>
							<div className='usersList'>
								<PrintFriendToAddChannel idMe={props.idMe} friends={props.friends} selectedFriend={selectedFriend} setSelectedFriend={setSelectedFriend} />
							</div>
							<button id="checkbox_nextChannelButton" type="button" onClick={() => setIsNextButtonClicked(!isNextButtonClicked)}>Next</button>
						</>
					}
				</>
			}

		</>
	)
	/*<div className='usersList'>
	{
		isNextButtonClicked && 
		<>
			<PrintChannelCreationSettings setIsNextButtonClicked={setIsNextButtonClicked}/> 
		</>
		||
		<>
			<PrintFriendToAddChannel friends={props.friends} selectedFriend={selectedFriend} setSelectedFriend={setSelectedFriend}/>
		</>
	}
	</div>
	{
		isNextButtonClicked &&
		<button id="checkbox_createChannelButton" formMethod='post' type="button" onClick={createChannel}>Create Channel</button>
		||
		<button id="checkbox_createChannelButton" type="button" onClick={() => setIsNextButtonClicked(true)}>Next</button>
	}*/
	/*{console.log("isNextButtonClicked: ", isNextButtonClicked)}
	{
		isNextButtonClicked && 
		<>
			<div className='userList'>
			</div>
			<button id="checkbox_createChannelButton" formMethod='post' type="button" onClick={createChannel}>Create Channel</button>
		</>
	}*/
	//<input type="button" id="createChannelButton" value="Create Channel" onClick={handleClick1}/>
}

export default SearchBarAddGroup;