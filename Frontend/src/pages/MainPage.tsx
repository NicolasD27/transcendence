import React, { Fragment, useState, useEffect, Dispatch, SetStateAction} from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io';
import axios from 'axios';
import { cp } from 'fs/promises';
import { Channel, channel } from 'diagnostics_channel';
import { collapseTextChangeRangesAcrossMultipleVersions, createEmitAndSemanticDiagnosticsBuilderProgram, isPropertySignature } from 'typescript';
import { join } from 'path';
import NotificationList from '../components/NotificationList';
import './MainPage.css'
import Header from './Header'
import Body from './Body'
import { chatStateFormat } from '../App';

const MainPage = ({socket, isFriendshipButtonClicked, setIsFriendshipButtonClicked, chatParamsState, setChatParamsState}: {socket: any, isFriendshipButtonClicked: boolean, setIsFriendshipButtonClicked: Dispatch<SetStateAction<boolean>>, chatParamsState: chatStateFormat, setChatParamsState: Dispatch<SetStateAction<chatStateFormat>> }) => {
	const [idMe, setIdMe] = useState(0);
	const [getIDMe, setGetIDMe] = useState(false);

	useEffect(() => {
		axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				const id_tmp = res.data;
				setIdMe(id_tmp.id)
			})
		setGetIDMe(getIDMe => true)
	} , [])

	return (
		<div id='bloc'>
			<Header idMe={idMe} />
			<Body idMe={idMe} socket={socket} isFriendshipButtonClicked={isFriendshipButtonClicked} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} chatParamsState={chatParamsState} setChatParamsState={setChatParamsState}/>
			{getIDMe && <NotificationList myId={idMe} socket={socket} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked}/>}
		</div>
	);
};

export default MainPage;