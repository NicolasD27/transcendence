import axios from "axios";
import React, { Fragment, Component, useState, useEffect } from "react";
import Notification, { User } from "./Notification";
import './NotificationList.css';
import bell from '../asset/notification.svg';
import socketIOClient from "socket.io-client";



export interface INotification {
	id: number,
	entityType: string,
	entityId: number, 
	receiver: User,
	name: string,
	awaitingAction: boolean,
	secondName?: string
}
function getAccessTokenFromCookies() {
	try {
		const cookieString = document.cookie.split('; ').find((cookie) => cookie.startsWith('accessToken'))
		if (cookieString)
			return ('bearer ' + cookieString.split('=')[1]);
	} catch (ex) {
		return '';
	}
}

const NotificationList = ({myId}: {myId: number}) => {
    const [notifications, setNotifications] = React.useState<INotification[]>([])
	const [open, setOpen] = React.useState(false)
	const [newNotifsLength, setNewNotifsLength] = React.useState(-1)

	useEffect(() => {
		if (myId != 0) {
			const socket = socketIOClient(`http://${process.env.REACT_APP_HOST || "localhost"}:8000`, {
				reconnection: true,
				transports : ['websocket', 'polling', 'flashsocket'],
				transportOptions: {
					polling: {
						extraHeaders: {
							Authorization: getAccessTokenFromCookies()
						}
					}
				}
			})
			socket.on("new_channel_invite_received", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
				.then(res => {
					setNotifications(notifications => res.data);	
					setNewNotifsLength(newNotifsLength => notifications.filter(notif  => notif.awaitingAction).length)

			})
			});
			socket.on("match_invite_to_client", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
				.then(res => {
					setNotifications(notifications => res.data);	
					setNewNotifsLength(newNotifsLength => notifications.filter(notif  => notif.awaitingAction).length)

			})
			});
			socket.on("notifyFriendRequest", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
				.then(res => {
					setNotifications(notifications => res.data);	
					setNewNotifsLength(newNotifsLength => notifications.filter(notif  => notif.awaitingAction).length)

			})
			});			
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
			.then(res => {
				setNotifications(notifications => res.data);	
				setNewNotifsLength(newNotifsLength => notifications.filter(notif  => notif.awaitingAction).length)

			})
		}
	}, [myId, notifications.length])
		

	const handleOpen = () => {
		setOpen(open => !open)
	}

	if (notifications.length > 0 && newNotifsLength == -1)
		setNewNotifsLength(newNotifsLength => notifications.filter(notif  => notif.awaitingAction).length)


	return (
		<Fragment>
			<img className="notifications-opener" src={bell} alt="" onClick={handleOpen}/>{newNotifsLength > 0 &&<span className="notifications-indicator">{newNotifsLength}</span>}
			<div className={`notifications-list-wrapper ${open ? "notifications-open" : "notifications-close"}`}>
				
				
				<h3 className="notifications-title">Notifications</h3>
				<div className="notifications-list-container">

					{notifications.map((notification: INotification, i) => (
						<Notification key={notification.id} newNotifsLength={newNotifsLength} setNewNotifsLength={setNewNotifsLength} notification={notification}/>
						))}
				</div>
			</div>
		</Fragment>
	);
};

export default NotificationList;