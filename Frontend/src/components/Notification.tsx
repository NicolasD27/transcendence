import axios from "axios";
import React, { Dispatch, Fragment, SetStateAction } from "react";
import './Progress-bar.css';
import accept from '../asset/accept.png';
import refuse from '../asset/failed.svg';
import "./Notification.css";
import { useNavigate } from 'react-router-dom';
import { INotification } from "./NotificationList";

export interface User {
	id: number,
	pseudo: string,
	avatarId: number,
	status: number
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
	notification: INotification
	newNotifsLength: number,
	setNewNotifsLength: Dispatch<SetStateAction<number>>;
}




const Notification: React.FC<Props> = ({notification, newNotifsLength, setNewNotifsLength}) => {
    const [content, setContent] = React.useState("");
	const [awaitingAction, setAwaitingAction] = React.useState(true);
	const navigate = useNavigate()

	
	if (content == "")
	{
		console.log(notification.receiver)
		setAwaitingAction(awaitingAction => notification.awaitingAction)
		if (notification.entityType == "Friendship")
			setContent(content => ` wants to be your friend`)
		else if (notification.entityType == "Match")
			setContent(content => ` challenged you`)
		else if (notification.entityType == "ChannelInvite")
			setContent(content => ` invited you to join `)
	}

	const handleAccept = () => {
		if (notification.entityType == "Friendship")
		{
			axios.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${notification.entityId}`, {status: 1}, { withCredentials: true })
			.then(res => {
				setAwaitingAction(awaitingAction => false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
		else if (notification.entityType == "Match")
		{
			axios.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/matchs/${notification.entityId}`, {status: 1, score1: 0, score2: 0}, { withCredentials: true })
			.then(res => {
				setAwaitingAction(awaitingAction => false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
		else if (notification.entityType == "ChannelInvite")
		{
			axios.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${notification.receiver.id}/invites/${notification.entityId}`, {}, { withCredentials: true })
			.then(res => {
				setAwaitingAction(awaitingAction => false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
	}

	const handleRefuse = () => {
		if (notification.entityType == "Friendship")
		{
			axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${notification.entityId}`, { withCredentials: true })
			.then(res => {
				setAwaitingAction(awaitingAction => false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
		else if (notification.entityType == "Match")
		{
			axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/matchs/${notification.entityId}`, { withCredentials: true })
			.then(res => {
				setAwaitingAction(awaitingAction => false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
		else if (notification.entityType == "ChannelInvite")
		{
			axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${notification.receiver.id}/invites/${notification.entityId}`, { withCredentials: true })
			.then(res => {
				console.log("todo refuse invite")
				setAwaitingAction(awaitingAction => false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
	}

	const handleClick = () => {
		if (notification.entityType == "Friendship")
			navigate(`/profil/${notification.entityId}`)
	}

	return (
		<div className="notification-container">
			<div><span className="notification-name" onClick={handleClick}>{notification.name}</span>{content}{notification.secondName 
			&& <span className="notification-name">{notification.secondName}</span>}</div> {awaitingAction 
			&& <div><img className="notification-icon" src={accept} alt="" onClick={handleAccept}/><img className="notification-icon" src={refuse} alt="" onClick={handleRefuse}/></div>}
		</div>
	);
};

export default Notification;