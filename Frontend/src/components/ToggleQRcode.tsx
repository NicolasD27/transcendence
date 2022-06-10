import  {  useEffect, useState } from "react";
import axios from 'axios';
import './ToggleQRcode.css';
import qrCode from '../asset/qr-code.svg';

const ToggleQRcode = ({isTwoFactorEnable}: {isTwoFactorEnable: boolean}) => {
	const [ischecked, setIsChecked] = useState(isTwoFactorEnable);

	useEffect(() => {
		setIsChecked(isTwoFactorEnable)
	}, [isTwoFactorEnable])
	const handleChange = () => {
		if (ischecked === false) {
			axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/2fa/turn-on-2FA`, {}, { withCredentials: true })
				.then(res => {
					setIsChecked(true)
				})
		}
		else {
			axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/2fa/turn-off-2FA`, {}, { withCredentials: true })
			.then(res => {
				setIsChecked(false)
			})
		}
		
	}

	return (
		<div className="boxQR">
			<img src={qrCode} className="imgQR" alt="QRcodeIcon"/>
			<input className="switch" type="checkbox" checked={ischecked} onChange={handleChange} />
		</div>
	);
};

export default ToggleQRcode;