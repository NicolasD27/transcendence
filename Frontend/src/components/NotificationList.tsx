import axios from "axios";
import React, { Fragment, Component, useState, useEffect } from "react";
import Notification from "./Notification";
import './NotificationList.css';

interface INotification {
	id: number,
	entityType: string,
	entityId: number
}

const NotificationList = ({myId}: {myId: number}) => {
    const [notifications, setNotifications] = React.useState([])
	const [isMounted, setIsMounted] = useState(false);
	if (isMounted === false) {
		
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/notifications/${myId}`, { withCredentials: true })
			.then(res => {
				const notifications = res.data;
				notifications.forEach((list: any) => {
					
				});
			})
		setIsMounted(isMounted => true)
	}
	return (
		<Fragment>
			<div className="notication-list-container">
				<div className="not">Match History:</div>
				<div className="boxHistory">
					{notifications.map((notification: INotification, i) => (
						<Notification  id={notification.id} entityId={notification.entityId} entityType={notification.entityType}/>
					))}
				</div>
			</div>
		</Fragment>
	);
};

export default NotificationList;