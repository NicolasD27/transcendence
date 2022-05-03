import React, { Component } from 'react';
import axios from 'axios';
import './Avatar.css';
import { convertTypeAcquisitionFromJson, parseJsonSourceFileConfigFileContent } from 'typescript';
import { profile } from 'console';

export interface Props {
	id: number;
	idMe: number;
}

export class Avatar extends React.Component<Props> {
	state = {
		profileImg: 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg',
	}
	imageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const reader = new FileReader();
		reader.onload = () => {
			if (reader.readyState === 2) {
				this.setState({ profileImg: reader.result })
			}
		}
		if (e.target.files)
			reader.readAsDataURL(e.target.files[0])
	};

	componentDidMount() {
		axios.get(`http://localhost:8000/api/users/${this.props.id}`, { withCredentials: true })
			.then(res => {
				const persons = res.data;
				if (persons.avatarId != null)
					this.setState({ profileImg: `http://localhost:8000/api/database-files/${persons.avatarId}` })
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