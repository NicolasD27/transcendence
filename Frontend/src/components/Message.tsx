import React from "react";
import './Message.css';

interface Props {
	message: string;
	name: string;
	avatar: string;
	own: boolean;
}

const Message: React.FC<Props> = (props) => {
	return (
		<div className={props.own ? "message own" : "message"}>
			<div className="messageTop">
				<img className="messageImg" src={props.avatar} alt="" />
				<div className="messageTxt">
					{props.own === false && <div className="messageUsername">{props.name}</div>}
					{props.message}
				</div>
			</div>
		</div >
	);
};

export default Message;