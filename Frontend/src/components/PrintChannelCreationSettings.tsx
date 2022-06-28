import React, { useState, Dispatch, SetStateAction} from 'react';
import './PrintChannelCreationSettings.css'

interface propsPrintChannelCreationSettings {
	setChannelVisibilitySelected : Dispatch<SetStateAction<string>>;
	setChannelNameEntered : Dispatch<SetStateAction<string>>;
	passwordEntered : string;
	setPasswordEntered : Dispatch<SetStateAction<string>>;
}

const PrintChannelCreationSettings : React.FC<propsPrintChannelCreationSettings> = (props) => {
	const [ isProtectedCLicked, setIsProtectedClicked ] = useState(false)
	const [ passwordNotSecure ] = useState("")

	const handlePasswordEntered = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		props.setPasswordEntered(e.target.value)
	}

	const handleChannelNameEntered = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		props.setChannelNameEntered(e.target.value)
	}
	////console.log("passwordNotSecure: ", passwordNotSecure)
	return (
		<>
			<div className='enterChannelName'>
				<label>Channel Name
					<input type="text" placeholder="My Channel Name" name="channelName" onChange={handleChannelNameEntered} required/>
				</label>
			</div>
			<div className='checkbox_ChannelSettings'>
					<input type='radio' name="modeChannel" id="isPublicChannel" onChange={() => {props.setChannelVisibilitySelected("public"); setIsProtectedClicked(false)}}/>
					<label htmlFor='isPublicChannel'></label>Public
			</div>
			<div className='checkbox_ChannelSettings'>
					<input type='radio' name="modeChannel" id="isProtectedChannel" onChange={() => { props.setChannelVisibilitySelected("protected"); setIsProtectedClicked(true)}}/>
					<label htmlFor="isProtectedChannel"></label>Protected
					{
						isProtectedCLicked &&
						<div className='createChannelPassword'>
							<input type="password" name="password" placeholder='Password' onChange={handlePasswordEntered} required/>
						</div>
					}
					{
						passwordNotSecure !== "" &&
						<div className="errorPassword"> {passwordNotSecure} </div>
					}
			</div>
			<div className='checkbox_ChannelSettings'>
					<input type='radio' name="modeChannel" id="isPrivateChannel" onChange={() => {props.setChannelVisibilitySelected("private"); setIsProtectedClicked(false)}}/>
					<label htmlFor='isPrivateChannel'></label>Private
			</div>
		</>
	)
}

export default PrintChannelCreationSettings;
