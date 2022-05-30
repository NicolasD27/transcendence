import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';

interface propsPrintChannelCreationSettings {
	setIsNextButtonClicked : Dispatch<SetStateAction<boolean>>;
	setChannelVisibilitySelected : Dispatch<SetStateAction<string>>;
	setChannelNameEntered : Dispatch<SetStateAction<string>>;
	passwordEntered : string;
	setPasswordEntered : Dispatch<SetStateAction<string>>;
}

const PrintChannelCreationSettings : React.FC<propsPrintChannelCreationSettings> = (props) => {
	const [ isProtectedCLicked, setIsProtectedClicked ] = useState(false)
	const [ passwordNotSecure, setPasswordNotSecure ] = useState("")

	const handlePasswordEntered = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		props.setPasswordEntered(e.target.value)
		if (props.passwordEntered.length < 1 || props.passwordEntered.length >= 32)
			setPasswordNotSecure("Password must contain between 1 and 31 characters")
	}

	const handleChannelNameEntered = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		props.setChannelNameEntered(e.target.value)
	}
	//console.log("passwordNotSecure: ", passwordNotSecure)
	return (
		<>
			<div className='enterChannelName'>
				<label>Channel Name
					<input type="text" placeholder="My Channel Name" name="channelName" onChange={handleChannelNameEntered} required/>
				</label>
			</div>
			<div className='checkbox_ChannelSettings'>
				<div>
					<label htmlFor='isPublicChannel'>Public</label>
					<input type='radio' name="modeChannel" id="isPublicChannel" onChange={() => {props.setChannelVisibilitySelected("public"); setIsProtectedClicked(false)}}/>
				</div>
				<div>
					<label htmlFor="isProtectedChannel"><br/>Protected</label>
					<input type='radio' name="modeChannel" id="isProtectedChannel" onChange={() => { props.setChannelVisibilitySelected("protected"); setIsProtectedClicked(true)}}/>
					{
						isProtectedCLicked && 
						<input type="password" name="password" placeholder='Password' id='createChannelPasswordInput' onChange={handlePasswordEntered} required/>
					}
					{	
						passwordNotSecure !== "" &&
						<div className="errorPassword"> {passwordNotSecure} </div>
					}
				</div>
				<div>
					<label htmlFor='isPrivateChannel'><br/>Private</label>
					<input type='radio' name="modeChannel" id="isPrivateChannel" onChange={() => {props.setChannelVisibilitySelected("private"); setIsProtectedClicked(false)}}/>
				</div>
			</div>
		</>
	)
}

export default PrintChannelCreationSettings;