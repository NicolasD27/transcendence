import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Profil from './pages/Profil';
import MainPage from './pages/MainPage';
import axios from 'axios';
import Login2FA from './pages/Login2FA';
import './pages/Home.css';
import './pages/Home.css';
import './pages/MainPage.css';
import './pages/Profil.css';
import './pages/Login2FA.css'
import './pages/404NotFound.css'
import './App.css'
import NotFound from './pages/404NotFound';
import ProtectedRoute from './protectedRoute';
import Loader from './components/Loader';
import socketIOClient, { io } from 'socket.io-client';
import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import RegisterForm from './pages/RegisterForm';

function getAccessTokenFromCookies() {
	try {
		const cookieString = document.cookie.split('; ').find((cookie) => cookie.startsWith('accessToken'))
		if (cookieString)
			return ('bearer ' + cookieString.split('=')[1]);
	} catch (ex) {
		return '';
	}
}

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

export interface chatStateFormat {
	chatState : boolean;
	id : number;
	chatName : string;
	type : string;
}

export interface FriendsFormat {
	friendshipId: number;
	id: number;
	username: string;
	pseudo: string;
	avatarId: string;
	status: number;
}

const App = () => {
  const [isAuth, setIsAuth] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [socket, setSocket] = React.useState<any>();
	const [isFriendshipButtonClicked, setIsFriendshipButtonClicked] = useState<boolean>(true)
	const [ chatParamsState, setChatParamsState ] = useState<chatStateFormat>({'chatState' : false, id : 0, chatName : "" , type : "directMessage" })
	const [friends, setFriends] = useState<FriendsFormat[]>([])
  const [friendRequestsSent, setFriendRequestsSent] = useState<number[]>([])
  const [friendRequestsReceived, setFriendRequestsReceived] = useState<FriendsFormat[]>([])

  if (!isAuth) {
    axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				setIsAuth(true)
        setIsLoading(false)
        setSocket(io(`http://${process.env.REACT_APP_HOST || "localhost"}:8000`, {
          reconnection: true,
          transports : ['websocket', 'polling', 'flashsocket'],
          transportOptions: {
            polling: {
              extraHeaders: {
                Authorization: getAccessTokenFromCookies()
              }
            }
          }
        }))
      })
      .catch(err => {
        setIsAuth(false)
        setIsLoading(false)
      })
  }
  return (
    <Fragment>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login-2FA" element={<Login2FA setIsAuth={setIsAuth}/>}/>
        <Route element={<ProtectedRoute isAuth={isAuth} isLoading={isLoading} />}>
          <Route path="/register" element={<RegisterForm />}/>
          <Route path="/mainpage" element={<MainPage  socket={socket} friends={friends} setFriends={setFriends} isFriendshipButtonClicked={isFriendshipButtonClicked} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} chatParamsState={chatParamsState} setChatParamsState={setChatParamsState} friendRequestsSent={friendRequestsSent} setFriendRequestsSent={setFriendRequestsSent} friendRequestsReceived={friendRequestsReceived} setFriendRequestsReceived={setFriendRequestsReceived}/>} />
          <Route path="/profil/:id" element={<Profil socket={socket} friends={friends} setFriends={setFriends} isFriendshipButtonClicked={isFriendshipButtonClicked} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} chatParamsState={chatParamsState} setChatParamsState={setChatParamsState} friendRequestsSent={friendRequestsSent} setFriendRequestsSent={setFriendRequestsSent} friendRequestsReceived={friendRequestsReceived} setFriendRequestsReceived={setFriendRequestsReceived}/>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Fragment>
  );
}

export default App;