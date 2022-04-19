import React, { Component } from 'react';
import axios from 'axios';
import './Avatar.css';
import { convertTypeAcquisitionFromJson, parseJsonSourceFileConfigFileContent } from 'typescript';

export class Avatar extends Component {
	state = {
		profileImg: 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg',
		persons: []
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
		axios.get(`http://localhost:8000/api/users/`, { withCredentials: true })
			.then(res => {
				const persons = res.data;
				console.log(persons)
				this.setState({ persons });
				if (persons.length) {
					this.setState({ profileImg: this.state.persons[0]["avatar"] })
				}
			})
	}

	/*<ul>
	{this.state.persons.map((person, i) =>
		<li key="{i}" style={{ color: 'white' }}>{person['username']}</li>)}
	</ul>*/

	render() {
		const { profileImg } = this.state
		return (
			<div className="img" style={{ backgroundImage: `url(${profileImg})`, height: 130, width: 130 }}>
				<input type="file" accept="image/*" name="image-upload" id="input" onChange={this.imageHandler} />
				<label className="image-upload" htmlFor="input">Upload</label>
			</div>
		);
	}
}

export default Avatar;