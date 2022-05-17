import axios from "axios";
import React, { Fragment, Component, useState, useEffect } from "react";
import Notification from "./Notification";
import './NotificationList.css';
import bell from '../asset/notification.svg';


interface INotification {
	id: number,
	entityType: string,
	entityId: number,
	name: string,
	awaitingAction: boolean
}

const NotificationList = ({myId}: {myId: number}) => {
    const [notifications, setNotifications] = React.useState([])
	const [open, setOpen] = React.useState(false)

	const [isMounted, setIsMounted] = useState(false);
	if (isMounted === false) {
		
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
			.then(res => {
				const notifications = setNotifications(notifications => res.data);
				setIsMounted(isMounted => true)
				
			})
		
	}

	const handleOpen = () => {
		setOpen(open => !open)
	}


	return (
		<Fragment>
			<img className="notifications-opener" src={bell} alt="" onClick={handleOpen}/>
			<div className={`notifications-list-wrapper ${open ? "notifications-open" : "notifications-close"}`}>
				
				
				<h3 className="notifications-title">Notifications</h3>
				<div className="notifications-list-container">

					{isMounted && notifications.map((notification: INotification, i) => (
						<Notification key={notification.id} id={notification.id} entityId={notification.entityId} entityType={notification.entityType} name={notification.name} awaitingAction={notification.awaitingAction}/>
						))}
				</div>
			</div>
		</Fragment>
	);
};

export default NotificationList;