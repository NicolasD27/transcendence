import React, { Component } from 'react';
import axios from 'axios';
import './Avatar.css';

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
		axios.get(`http://localhost:8000/api/users`)
			.then(res => {
				const persons = res.data;
				this.setState({ persons });
			})
	}

	render() {
		const { profileImg } = this.state
		return (
			/*<div>
				<div className="img-holder">
					<img src={profileImg} alt="" id="img" className="img" />
				</div>
				<input type="file" accept="image/*" name="image-upload" id="input" onChange={this.imageHandler} />
				<div className="label">
					<label className="image-upload" htmlFor="input">Upload</label>
				</div>
				<ul>
					{this.state.persons.map(person => <li style={{ color: 'white' }}>{person['name']}</li>)}
				</ul>
			</div>*/
			<div className="img" style={{ backgroundImage: `url(${profileImg})`, height: 130, width: 130 }}>
				<input type="file" accept="image/*" name="image-upload" id="input" onChange={this.imageHandler} />
				<label className="image-upload" htmlFor="input">Upload</label>
			</div>
		);
	}
}

export default Avatar;