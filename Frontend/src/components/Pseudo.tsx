import React, {  Dispatch, SetStateAction, useEffect } from "react";
import axios from 'axios';
import './Pseudo.css';
import edit from '../asset/edit-button.svg';

export interface Props {
	id: number;
	idMe: number;
	setGetMatch?: Dispatch<SetStateAction<boolean>>;
}

const Pseudo: React.FC<Props> = (props) => {
	const [pseudo, setPseudo] = React.useState("");
	const [tmpPseudo, settmpPseudo] = React.useState("");
	const [onChange, setOnChange] = React.useState(false);
	const [getpseudo, setGetPseudo] = React.useState(false);
	const id = props.id;
	const idMe = props.idMe;

	useEffect(() => {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${id}`, { withCredentials: true })
			.then(res => {
				const profil = res.data;
				setPseudo(pseudo => profil.pseudo)
			})
		setGetPseudo(true);
	}, [getpseudo, id])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		settmpPseudo(tmpPseudo => e.target.value)
	}

	const validChange = (e: React.KeyboardEvent<HTMLInputElement> | any) => {
		const username = e.target
		if (e.key === 'Enter') {
			if (username) { //Si le nom n'est pas vide
				const bodyFormData = new FormData();
				bodyFormData.append('pseudo', tmpPseudo)
				axios.post(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/pseudo`, bodyFormData, { withCredentials: true })
					.then(res => {
						setGetPseudo(false)
						if (props.setGetMatch)
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

	return (
		<div className="boxPseudo">
			{onChange === false && <div className="labelPseudo">{pseudo}</div>}
			{onChange === true && <input type="text" className="writePseudo" onChange={handleChange} onKeyUp={validChange} value={tmpPseudo} />}
			{id === idMe && <button type='submit' style={{ backgroundImage: `url(${edit})` }} onClick={() => setOnChange(true)} className="editPseudo" />}
		</div>
	);
};

export default Pseudo;