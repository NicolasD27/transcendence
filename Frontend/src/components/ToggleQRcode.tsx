import  {  Fragment, useEffect, useState } from "react";
import axios from 'axios';
import './ToggleQRcode.css';
import qrCode from '../asset/qr-code.svg';

const ToggleQRcode = ({isTwoFactorEnable}: {isTwoFactorEnable: boolean}) => {
	const [ischecked, setIsChecked] = useState(isTwoFactorEnable);
	const [QRcode, setQRcode] = useState<Blob>();
	const [code, setCode] = useState("");
	const [showQRCode, setShowQRCode] = useState(false);

	useEffect(() => {
		setIsChecked(isTwoFactorEnable)
	}, [isTwoFactorEnable])
	const handleChange = () => {
		if (ischecked === false) {
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/2fa/generate-qr`, { withCredentials: true, responseType: 'blob' })
			.then(res => {
				setQRcode(QRcode => res.data)
				setShowQRCode(true)
			})
			
		}
		else {
			axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/2fa/turn-off-2FA`, {}, { withCredentials: true })
			.then(res => {
				setIsChecked(false)
			})
		}
		
	}

	const handleChangeCode = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCode(code => e.target.value)
	}

	const handleSubmit = () => {
		console.log("submitting")
		axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/2fa/turn-on-2FA`, {}, { withCredentials: true })
		.then(() => {
			axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/2fa/authenticate`, { code: code }, { withCredentials: true })
			.then(() => {
				setShowQRCode(false)
				setIsChecked(true)
			})
			.catch(err => {
				const input = document.getElementById("input");
				if (input) {
					input.classList.add('error');
					setTimeout(function () {
						input.classList.remove('error');
						setCode("")
					}, 300);
				}
				

		})})
		setCode("")

		
	}

	const handleKeyPress = (event: any) => {
		if (event.key === 'Enter') {
			handleSubmit()
		}
	}


	return (
		<Fragment>
			<div className="boxQR">
				<img src={qrCode} className="imgQR" alt="QRcodeIcon"/>
				<input className="switch" type="checkbox" checked={ischecked} onChange={handleChange} />
				
			</div>
			{showQRCode && QRcode && <div id="login-modal" >
				<div>
					<img src={URL.createObjectURL(QRcode)} alt='QR code' className="qrcode" />
					<p className='login-title'>Scan with Google Authenticator</p>
					<input autoFocus autoComplete='off' type="text" id="input" onChange={handleChangeCode}  value={code} placeholder="______" onKeyDown={handleKeyPress} />
					<button onClick={handleSubmit} className="ButtonStyle navButton">Valider</button>
				</div>
			</div>}
		</Fragment>
		);
};

export default ToggleQRcode;