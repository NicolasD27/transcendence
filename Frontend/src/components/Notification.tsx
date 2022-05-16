import axios from "axios";
import React, { Fragment } from "react";
import './Progress-bar.css';


interface Props {
	id: number,
    entityType: string,
    entityId: number
}




const Notification: React.FC<Props> = (props) => {
    const [content, setContent] = React.useState("");

	axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/${props.entityType}/${props.entityId}`, { withCredentials: true })
			.then(res => {
				const precisions = res.data;
                if (props.entityType == "Frienship")
                    setContent(content => `${precisions.follower.pseudo} wants to be your friend`)
                else if (props.entityType == "Match")
                    setContent(content => `${precisions.user1.pseudo} wants to make a match`)
				
			})
	return (
		<Fragment>
			<div className="notification-container">
                {content}
            </div>
		</Fragment>
	);
};

export default Notification;