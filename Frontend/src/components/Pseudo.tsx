import React, { Fragment } from "react";
import './Pseudo.css';
import edit from '../asset/edit-button.svg';

export interface Props {
	id: number;
	idMe: number;
}

const Pseudo: React.FC<Props> = (props) => {
	const [newPseudo, setNewPseudo] = React.useState("");
	const [onChange, setOnChange] = React.useState(false);
	const id = props.id;
	const idMe = props.idMe;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setNewPseudo(newPseudo => e.target.value)
	}

	const validChange = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		let username = e.target
		if (e.key === 'Enter') {
			//Post et regarder si la reponse est false ou true
			if (username) { //Si la reponse est false
				console.log("New pseudo valid: " + newPseudo)
				username.classList.add('error');
				setTimeout(function () {
					if (username)
						username.classList.remove('error');
					setOnChange(false)
					setNewPseudo("")
				}, 300);
			}
			//setOnChange(false)
			//setNewPseudo("")
		}
	}

	const editPseudo = () => {
		if (onChange === false)
			return <div className="labelPseudo">Jsaguez</div>
		else {
			return <input type="text" id="input" onChange={handleChange} onKeyUp={validChange} value={newPseudo} />
		}
	}
	if (id === idMe) {
		return (
			<div className="boxPseudo">
				{editPseudo()}
				<button type='submit' style={{ backgroundImage: `url(${edit})` }} onClick={() => setOnChange(true)} className="editPseudo" />
			</div>
		);
	}
	else {
		return (
			<div className="boxPseudo">
				{editPseudo()}
			</div>
		);
	}
};

export default Pseudo;