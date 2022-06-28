import React, { useState, Dispatch, SetStateAction } from 'react';
import axios from 'axios'
import PrintChannelCreationSettings from './PrintChannelCreationSettings'
import searchIcon from '../asset/searchIcon.svg'
import { FriendsFormat } from '../App'
import { chatStateFormat } from '../App'
import './SearchBarAddGroup.css'

interface PropsSearchBarAddGroup {
	idMe: number;
	setSearchValue: Dispatch<SetStateAction<string>>
	friends: FriendsFormat[];
	createChannelButtonState: boolean;
	setCreateChannelButtonState: Dispatch<SetStateAction<boolean>>;
	setChatParamsState : Dispatch<SetStateAction<chatStateFormat>>;
	chatParamsState : chatStateFormat;
	printSearchBar : boolean;
	setPrintSearchBar : Dispatch<SetStateAction<boolean>>
}

const SearchBarAddGroup: React.FC<PropsSearchBarAddGroup> = (props) => {
	const [channelVisibilitySelected, setChannelVisibilitySelected] = useState("public")
	const [channelNameEntered, setChannelNameEntered] = useState("")
	const [passwordEntered, setPasswordEntered] = useState("")
	
	const handleSearchRequest = (e: any) => {
		props.setSearchValue("")
		let value = e.target.value
		props.setSearchValue(value)
	}

	const handleClick = () => {
		props.setCreateChannelButtonState(!props.createChannelButtonState)
		props.setPrintSearchBar(!props.printSearchBar)
	}

	const createChannel = () => {
		let tmpPrivate = false
		let tmpProtected = false
		if (channelVisibilitySelected === "private")
			tmpPrivate = true
		else if (channelVisibilitySelected === "protected")
			tmpProtected = true

		if (channelVisibilitySelected === "protected")
			axios
				.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels`, {
					"name": channelNameEntered,
					"isPrivate": tmpPrivate,
					"isProtected": tmpProtected,
					"password": passwordEntered
				}, { withCredentials: true })
				.then((response) => {
					props.setChatParamsState({ 'chatState': true, id: response.data.id, chatName: channelNameEntered, type: "channel" }) //print the channel message window
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
				.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/channels`, {
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
			{
				props.printSearchBar && 
				<div className="searchAndAdd">
					<div id="searchBar">
						<img src={searchIcon} alt="searchIcon" id='searchIcon' />
						<input type='text' placeholder='Search...' name='searchFriend' id='searchFriend' onChange={handleSearchRequest} />
					</div>
					<button id='addGroup' onClick={handleClick}/>
				</div>
			}
			{
				props.createChannelButtonState &&
				<>
					{
						<>
							<div className='channelCreationSettings'>
								<PrintChannelCreationSettings setChannelVisibilitySelected={setChannelVisibilitySelected} setChannelNameEntered={setChannelNameEntered} passwordEntered={passwordEntered} setPasswordEntered={setPasswordEntered} />
							</div>
							<button id="checkbox_firstChannelButton" type="button" onClick={() => {props.setCreateChannelButtonState(false); props.setPrintSearchBar(true)}}>Previous</button>
							<button id="checkbox_secondChannelButton" formMethod='post' type="button" onClick={createChannel}>Create Channel</button>
						</>
					}
				</>
			}
		</>
	)
}

export default SearchBarAddGroup;