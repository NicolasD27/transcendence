import React, { Fragment, Dispatch, SetStateAction } from "react";
import axios from 'axios';
import './Pseudo.css';
import edit from '../asset/edit-button.svg';

export interface Props {
	id: number;
	idMe: number;
	setGetMatch: Dispatch<SetStateAction<boolean>>;
}

const Pseudo: React.FC<Props> = (props) => {
	const [pseudo, setPseudo] = React.useState("");
	const [tmpPseudo, settmpPseudo] = React.useState("");
	const [onChange, setOnChange] = React.useState(false);
	const [getpseudo, setGetPseudo] = React.useState(false);
	const id = props.id;
	const idMe = props.idMe;
	//let getmatch = props.getmatch;

	if (getpseudo === false) {
		axios.get(`http://localhost:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const profil = res.data;
				setPseudo(pseudo => profil.pseudo)
			})
		setGetPseudo(true)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		settmpPseudo(tmpPseudo => e.target.value)
	}

	const validChange = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		const username = e.target
		if (e.key === 'Enter') {
			if (username) { //Si le nom n'est pas vide
				const bodyFormData = new FormData();
				bodyFormData.append('pseudo', tmpPseudo)
				axios.post(`http://localhost:8000/api/users/pseudo`, bodyFormData, { withCredentials: true })
					.then(res => {
						setGetPseudo(false)
						props.setGetMatch(false)
						if (res.data === false) {//Si le pseudo est deja prit
							username.classList.add('error');
							setTimeout(function () {
								username.classList.remove('error');
								setOnChange(false)
								settmpPseudo("")
							}, 300);
						}
						else {
							setOnChange(false)
							settmpPseudo("")
						}
					})
			}
		}
	}

	const editPseudo = () => {
		if (onChange === false)
			return <div className="labelPseudo">{pseudo}</div>
		else {
			return <input type="text" className="writePseudo" onChange={handleChange} onKeyUp={validChange} value={tmpPseudo} />
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