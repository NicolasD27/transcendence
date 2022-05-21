import axios from "axios";
import React, { Dispatch, Fragment, SetStateAction, useEffect } from "react";
import './Progress-bar.css';
import accept from '../asset/accept.svg';
import refuse from '../asset/refuse.svg';
import "./Notification.css";
import { useNavigate } from 'react-router-dom';
import { INotification } from "./NotificationList";
import { Socket } from "socket.io";

export interface User {
	id: number,
	pseudo: string,
	avatarId: number,
	status: number
}

interface Props {
	notification: INotification
	newNotifsLength: number,
	setNewNotifsLength: Dispatch<SetStateAction<number>>;
	socket: Socket
}




const Notification: React.FC<Props> = ({notification, newNotifsLength, setNewNotifsLength, socket}) => {
    const [content, setContent] = React.useState("");
	const [awaitingAction, setAwaitingAction] = React.useState(true);
	const navigate = useNavigate()

	useEffect(() => {
		setAwaitingAction(notification.awaitingAction)
		if (notification.entityType == "Friendship")
			setContent(` wants to be your friend`)
		else if (notification.entityType == "Match")
			setContent(` challenged you`)
		else if (notification.entityType == "ChannelInvite")
			setContent(` invited you to join `)
	}, [notification])
	

	const handleAccept = () => {
		if (notification.entityType == "Friendship")
		{
			axios.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${notification.entityId}`, {status: 1}, { withCredentials: true })
			.then(res => {
				setAwaitingAction(false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
		else if (notification.entityType == "Match")
		{
			setAwaitingAction(false)
			setNewNotifsLength(newNotifsLength - 1)
			navigate("/login")
			socket.emit("accept_challenge", {match_id: notification.entityId})
			console.log("sending accept event")
		}
		else if (notification.entityType == "ChannelInvite") 
		{
			axios.patch(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${notification.receiver.id}/invites/${notification.entityId}`, {}, { withCredentials: true })
			.then(res => {
				setAwaitingAction(false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
	}

	const handleRefuse = () => {
		if (notification.entityType == "Friendship")
		{
			axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/friendships/${notification.entityId}`, { withCredentials: true })
			.then(res => {
				setAwaitingAction(false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
		else if (notification.entityType == "Match")
		{
			axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/matchs/${notification.entityId}`, { withCredentials: true })
			.then(res => {
				setAwaitingAction(false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
		else if (notification.entityType == "ChannelInvite")
		{
			axios.delete(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/${notification.receiver.id}/invites/${notification.entityId}`, { withCredentials: true })
			.then(res => {
				console.log("todo refuse invite")
				setAwaitingAction(false)
				setNewNotifsLength(newNotifsLength - 1)
			})
		}
	}

	const handleClick = () => {
		navigate(`/profil/${notification.senderId}`)
	}

	return (
		<div className="notification-container">
			<div>
				<span className="notification-name" onClick={handleClick}>{notification.name}</span>{content}
				{notification.secondName && <span className="notification-name">{notification.secondName}</span>}
			</div> 
			{awaitingAction && 
			<div className="notification-icon-wrapper" >
				<div className="notification-icon-container"><img className="notification-icon" src={accept} alt="" onClick={handleAccept}/></div>
				<div className="notification-icon-container"><img className="notification-icon" src={refuse} alt="" onClick={handleRefuse}/></div>
			</div>}
		</div>
	);
};

export default Notification;