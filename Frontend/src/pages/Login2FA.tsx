import React, { Component } from 'react';
import axios from 'axios';
import './Login2FA.css';

export class Login2FA extends Component {
	state = {
		code: "",
		qrcode: null
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

    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({code: e.target.value})
    }

    handleSubmit = () => {
        axios.post(`http://localhost:8000/api/2fa/authenticate`, {code: this.state.code}, {withCredentials: true	})
			.then(res => {
				console.log(res)
			})
    }

	componentDidMount() {
        console.log(document.cookie)
		axios.get(`http://localhost:8000/api/2fa/generate-qr`, {withCredentials: true, responseType: 'blob'	})
			.then(res => {
				console.log(res)
				this.setState({qrcode: res.data})
			})
	}

	render() {
		const { code, qrcode } = this.state
		
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
            <div className="login-wrapper">

                <div >
					{qrcode && <img src={URL.createObjectURL(qrcode)} />}
                    <div id="login-container">
                        
                        <input type="text" id="input" onChange={this.handleChange} value={code}/>
                        <button onClick={this.handleSubmit} className="ButtonStyle navButton">Valider</button>
                    </div>
                </div>
            </div>
		);
	}
}

export default Login2FA;