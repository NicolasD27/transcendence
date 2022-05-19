import axios from "axios";
import React, { Dispatch, Fragment, SetStateAction } from "react";
import './Progress-bar.css';
import accept from '../asset/accept.png';
import refuse from '../asset/failed.svg';
import "./Notification.css";

interface User {
	id: number,
	pseudo: string,
	avatarId: number
}

interface Friendship {
	id: number,
	follower: User,
	following: User
}

interface Match {
	id: number,
	user1: User,
	user2: User 
}

interface Props {
	id: number,
    entityType: string,
    entityId: number,
	name: string,
	awaitingAction: boolean,
	newNotifsLength: number,
	setNewNotifsLength: Dispatch<SetStateAction<number>>;
}




const Notification: React.FC<Props> = (props) => {
    const [content, setContent] = React.useState("");
	const [awaitingAction, setAwaitingAction] = React.useState(true);


	
	if (content == "")
	{
		setAwaitingAction(awaitingAction => props.awaitingAction)
		if (props.entityType == "Friendship")
			setContent(content => `${props.name} wants to be your friend`)
		else if (props.entityType == "Match")
			setContent(content => `${props.name} challenged you`)
	}

	const handleAccept = () => {
		if (props.entityType == "Friendship")
		{
			axios.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.entityId}`, {status: 1}, { withCredentials: true })
			.then(res => {
				setAwaitingAction(awaitingAction => false)
				props.setNewNotifsLength(props.newNotifsLength - 1)
			})
		}
		else if (props.entityType == "Match")
		{
			axios.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/matchs/${props.entityId}`, {status: 1, score1: 0, score2: 0}, { withCredentials: true })
			.then(res => {
				setAwaitingAction(awaitingAction => false)
				props.setNewNotifsLength(props.newNotifsLength - 1)
			})
		}
	}

	const handleRefuse = () => {
		if (props.entityType == "Friendship")
		{
			axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${props.entityId}`, { withCredentials: true })
			.then(res => {
				setAwaitingAction(awaitingAction => false)
				props.setNewNotifsLength(props.newNotifsLength - 1)
			})
		}
		else if (props.entityType == "Match")
		{
			axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/matchs/${props.entityId}`, { withCredentials: true })
			.then(res => {
				setAwaitingAction(awaitingAction => false)
				props.setNewNotifsLength(props.newNotifsLength - 1)
			})
		}
	}
	return (
		<Fragment>
			<div className="notification-container">
                {content} {awaitingAction && <div><img className="notification-icon" src={accept} alt="" onClick={handleAccept}/><img className="notification-icon" src={refuse} alt="" onClick={handleRefuse}/></div>}
            </div>
		</Fragment>
	);
};

export default Notification;