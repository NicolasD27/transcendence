import axios from "axios";
import React, { Fragment, useEffect, Dispatch, SetStateAction } from "react";
import Notification, { User } from "./Notification";
import './NotificationList.css';
import bell from '../asset/notificationIcon2.svg';
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
	secondName?: string,
}


const NotificationList = ({ myId, socket, setIsFriendshipButtonClicked }: { myId: number, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>> }) => {
	const [notifications, setNotifications] = React.useState<INotification[]>([])
	const [open, setOpen] = React.useState(false)
	const [newNotifsLength, setNewNotifsLength] = React.useState(-1)

	/*const refreshNotificationList = (id) => {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${id}`, { withCredentials: true})
			.then(res => {
				setNotifications(notifications => res.data.reverse());
			})
	}*/

	useEffect(() => {
		const abortController = new AbortController()

		if (myId !== 0 && socket) {
			socket.on("new_channel_invite_received", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true, signal : abortController.signal })
			.then(res => {
				setNotifications(notifications => res.data.reverse());
			})
			.catch((err) => {})
			})
			socket.on("match_invite_to_client", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true, signal : abortController.signal })
			.then(res => {
				setNotifications(notifications => res.data.reverse());
			})
			.catch((err) => {})
			})
			socket.on("notifyFriendRequest", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true, signal : abortController.signal })
			.then(res => {
				setNotifications(notifications => res.data.reverse());
			})
			.catch((err) => {})
			})
			socket.on("notifyFriendRequestAccepted", data => {
				axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true, signal : abortController.signal })
			.then(res => {
				setNotifications(notifications => res.data.reverse());
			})
			.catch((err) => {})
			})
			axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true, signal : abortController.signal })
			.then(res => {
				setNotifications(notifications => res.data.reverse());
			})
			.catch((err) => {})
		}
		return () => { abortController.abort() }
	}, [myId, socket])


	useEffect(() => {
		const abortController = new AbortController()
		setNewNotifsLength(newNotifsLength => notifications.filter(notif => notif.awaitingAction).length)
		return () => { abortController.abort() }
	}, [notifications])

	const handleResize = () => {

		const gameArea = document.getElementById("gameArea")
		const notifContainer = document.querySelector(".notifications-list-wrapper")
		if (notifContainer && gameArea)
			notifContainer.setAttribute("style", `height:${gameArea.offsetHeight}px`);

	}

	useEffect(() => {
		handleResize()
		window.addEventListener('resize', handleResize)

	})


	const handleOpen = () => {
		setOpen(open => !open)
	}


	return (
		<Fragment>
			<img className="notifications-opener" src={bell} alt="" onClick={handleOpen} />{newNotifsLength > 0 && <span className="notifications-indicator">{newNotifsLength}</span>}
			<div className={`notifications-list-wrapper ${open ? "notifications-open" : "notifications-close"}`}>


				<h3 className="notifications-title">Notifications</h3>
				<div className="notifications-list-container">

					{notifications.map((notification: INotification, i) => (
						<Notification key={notification.id} socket={socket} newNotifsLength={newNotifsLength} setNewNotifsLength={setNewNotifsLength} notification={notification} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} />
					))}
				</div>
			</div>
		</Fragment>
	);
};

export default NotificationList;