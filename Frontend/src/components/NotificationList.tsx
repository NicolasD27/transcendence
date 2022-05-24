import axios from "axios";
import React, { Fragment, Component, useState, useEffect } from "react";
import Notification, { User } from "./Notification";
import './NotificationList.css';
import bell from '../asset/notification.svg';
import socketIOClient from "socket.io-client";
import { Socket } from "socket.io";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';



export interface INotification {
	id: number,
	entityType: string,
	entityId: number, 
	receiver: User,
	name: string,
	senderId: number,
	awaitingAction: boolean,
	secondName?: string
}


const NotificationList = ({myId, socket}: {myId: number, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>}) => {
    const [notifications, setNotifications] = React.useState<INotification[]>([])
	const [open, setOpen] = React.useState(false)
	const [newNotifsLength, setNewNotifsLength] = React.useState(-1)

	useEffect(() => {
		if (myId != 0) {
			
			socket.on("new_channel_invite_received", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
				.then(res => {
					setNotifications(notifications => res.data.reverse());	

			})
			});
			socket.on("match_invite_to_client", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
				.then(res => {
					setNotifications(notifications => res.data.reverse());	

			})
			});
			socket.on("notifyFriendRequest", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
				.then(res => {
					setNotifications(notifications => res.data.reverse());	

			})
			});			
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
			.then(res => {
				setNotifications(notifications => res.data.reverse());	
				

			})
		}
	}, [myId])

	useEffect(() => {
		setNewNotifsLength(newNotifsLength => notifications.filter(notif  => notif.awaitingAction).length)
	}, [notifications.length])
		

	const handleOpen = () => {
		setOpen(open => !open)
	}


	return (
		<Fragment>
			<img className="notifications-opener" src={bell} alt="" onClick={handleOpen}/>{newNotifsLength > 0 &&<span className="notifications-indicator">{newNotifsLength}</span>}
			<div className={`notifications-list-wrapper ${open ? "notifications-open" : "notifications-close"}`}>
				
				
				<h3 className="notifications-title">Notifications</h3>
				<div className="notifications-list-container">

					{notifications.map((notification: INotification, i) => (
						<Notification key={notification.id} socket={socket} newNotifsLength={newNotifsLength} setNewNotifsLength={setNewNotifsLength} notification={notification}/>
						))}
				</div>
			</div>
		</Fragment>
	);
};

export default NotificationList; 