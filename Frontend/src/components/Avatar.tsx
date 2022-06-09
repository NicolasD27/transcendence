import React, { Component, Dispatch, SetStateAction } from 'react';
import axios from 'axios';
import './Avatar.css';
//import FormData from 'form-data';//
//import { request } from 'http';//

export interface Props {
	id: number;
	idMe: number;
	setGetMatch?: Dispatch<SetStateAction<boolean>>;
}

export class Avatar extends React.Component<Props> {
	state = {
		imgDefault: 'https://images.assetsdelivery.com/compings_v2/anatolir/anatolir2011/anatolir201105528.jpg',
		profileImg: '',
		selectfile: null
	}

	imageHandler = (event: any) => {
		this.setState({
			selectfile: event.target.files[0]
		})
		const bodyFormData = new FormData();
		bodyFormData.append('file', event.target.files[0])
		axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/avatar`, bodyFormData, { withCredentials: true })
			.then(res => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${this.props.id}`, { withCredentials: true })
					.then(res => {
						const user = res.data;
						if (user.avatarId != null)
							this.setState({ profileImg: `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${user.avatarId}` })
						if (this.props.setGetMatch)
							this.props.setGetMatch(false)
					})
			})
	};

	componentDidMount() {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${this.props.id}`, { withCredentials: true })
			.then(res => {
				const user = res.data;
				if (user.avatarId != null)
					this.setState({ profileImg: `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${user.avatarId}` })
				else
					this.setState({ profileImg: this.state.imgDefault })
			})
	}

	componentDidUpdate(prevProps: Props) {
		if (prevProps.id != this.props.id) {
			console.log("here")
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${this.props.id}`, { withCredentials: true })
			.then(res => {
				const user = res.data;
				if (user.avatarId != null)
				this.setState({ profileImg: `http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/database-files/${user.avatarId}` })
				else
				this.setState({ profileImg: this.state.imgDefault })
			})
		}
	}

	render() {
		const { profileImg } = this.state



		const buttonUpload = <div style={{ borderRadius: "50%", height: 130, width: 130 }}>
			<input type="file" accept="image/*" name="image-upload" id="input" onChange={this.imageHandler} />
			<label className="image-upload" htmlFor="input">Upload</label>
		</div>

		return (
			<div className="img" style={{ backgroundImage: `url(${profileImg})`, height: 130, width: 130 }}>
				{this.props.id === this.props.idMe && buttonUpload}
			</div>
		);
	}
}

export default Avatar;