import React, { Fragment, useState } from "react";
import axios from 'axios';
import './ToggleQRcode.css';
import qrCode from '../asset/qr-code.svg';

const ToggleQRcode = () => {
	const [ischecked, setIsChecked] = useState(false);
	const handleChange = () => {
		if (ischecked === false) {
			axios.post(`http://localhost:8000/api/2fa/turn-on-2FA`, {}, { withCredentials: true })
				.then(res => {
				})
		}
		else {
			axios.post(`http://localhost:8000/api/2fa/turn-off-2FA`, {}, { withCredentials: true })
		}
		setIsChecked(!ischecked)
	}

	return (
		<div className="boxQR">
			<img src={qrCode} className="imgQR" />
			<input className="switch" type="checkbox" checked={ischecked} onChange={handleChange} />
		</div>
	);
};

export default ToggleQRcode;