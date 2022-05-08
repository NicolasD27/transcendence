import React, { Component } from 'react';
import axios from 'axios';
import './Avatar.css';
import { convertTypeAcquisitionFromJson, parseJsonSourceFileConfigFileContent } from 'typescript';
import { profile } from 'console';
//import FormData from 'form-data';//
//import { request } from 'http';//

export interface Props {
	id: number;
	idMe: number;
}

export class Avatar extends React.Component<Props> {
	state = {
		profileImg: 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg',
		selectfile: null
	}
	/*imageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.readyState === 2) {
				this.setState({ profileImg: reader.result })
			}
		}
		if (e.target.files)
			reader.readAsDataURL(e.target.files[0])
	};*/

	imageHandler = (event: any) => {
		this.setState({
			selectfile: event.target.files[0]
		})
		const bodyFormData = new FormData();
		bodyFormData.append('file', event.target.files[0])
		//const config = { headers: { 'Content-Type': 'multipart/form-data' } };
		axios.post(`http://localhost:8000/api/users/avatar`, bodyFormData, { withCredentials: true })
			.then(res => {
				console.log("WESH: " + event.target.files[0])
			})
		console.log(event.target.files[0])
		axios.get(`http://localhost:8000/api/users/${this.props.id}`, { withCredentials: true })
			.then(res => {
				const persons = res.data;
				console.log("LoadID: " + persons.avatarId)
				if (persons.avatarId != null)
					this.setState({ profileImg: `http://localhost:8000/api/database-files/${persons.avatarId}` })
			})
	};

	componentDidMount() {
		axios.get(`http://localhost:8000/api/users/${this.props.id}`, { withCredentials: true })
			.then(res => {
				const persons = res.data;
				console.log("MontID: " + persons.avatarId)
				if (persons.avatarId != null)
					this.setState({ profileImg: `http://localhost:8000/api/database-files/${persons.avatarId}` })
				console.log("Profile: " + this.state.profileImg)
			})
	}

	render() {
		const { profileImg } = this.state
		let buttonUpload = <div></div>

		if (this.props.id == this.props.idMe)
			buttonUpload = <div>
				<input type="file" accept="image/*" name="image-upload" id="input" onChange={this.imageHandler} />
				<label className="image-upload" htmlFor="input">Upload</label>
			</div>

		return (
			<div className="img" style={{ backgroundImage: `url(${profileImg})`, height: 130, width: 130 }}>
				{buttonUpload}
			</div>
		);
	}
}

export default Avatar;