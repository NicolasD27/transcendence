import React, { Component } from 'react';
import './Avatar.css'

export class Avatar extends Component {
	state = {
		profileImg: 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg'
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

	render() {
		const { profileImg } = this.state
		return (
			<div>
				<div className="img-holder">
					<img src={profileImg} alt="" id="img" className="img" />
				</div>
				<input type="file" accept="image/*" name="image-upload" id="input" onChange={this.imageHandler} />
				<div className="label">
					<label className="image-upload" htmlFor="input">Change Avatar</label>
				</div>
			</div>
		);
	}
}

export default Avatar;