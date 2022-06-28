import React, { Fragment, useEffect } from 'react';
import { useState } from 'react';
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
import { io } from 'socket.io-client';
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

export interface chatStateFormat {
  chatState: boolean;
  id: number;
  chatName: string;
  type: string;
}

export interface FriendsFormat {
  friendshipId: number;
  friendshipStatus: number;
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
  const [chatParamsState, setChatParamsState] = useState<chatStateFormat>({ 'chatState': false, id: 0, chatName: "", type: "directMessage" })
  const [friends, setFriends] = useState<FriendsFormat[]>([])
  const [blockedByUsers, setBlockedByUsers] = useState<number[]>([])
  const [friendRequests, setFriendRequests] = useState<number[]>([])

  useEffect(() => {
    if (!isAuth) {
      axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, { withCredentials: true })
        .then(res => {
          setSocket(io(`http://${process.env.REACT_APP_HOST || "localhost"}:8000`, {
            reconnection: true,
            transports: ['websocket', 'polling', 'flashsocket'],
            transportOptions: {
              polling: {
                extraHeaders: {
                  Authorization: getAccessTokenFromCookies()
                }
              }
            }
          }))
          setIsAuth(true)
          setIsLoading(false)
          
        })
        .catch(err => {
          setIsAuth(false)
          setIsLoading(false)
        })
    }
  }, [isAuth])

  useEffect(() => {
    if (socket) {
      window.addEventListener('beforeunload', () => {
        //console.log('disconnecting...')
        socket.emit('disconnect')
      })
    }
  }, [socket])

  useEffect(() => {
    axios
			.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/blockers`, { withCredentials: true })
			.then((res) => {
        res.data.forEach((user) => 
          setBlockedByUsers([...blockedByUsers, user.id])
        )
      })
			.catch((err) => console.log(err))
  }, [])
  
  return (
    <Fragment>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login-2FA" element={<Login2FA setIsAuth={setIsAuth} />} />
        <Route element={<ProtectedRoute isAuth={isAuth} isLoading={isLoading} />}>
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/mainpage" element={<MainPage socket={socket} friends={friends} setFriends={setFriends} isFriendshipButtonClicked={isFriendshipButtonClicked} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} chatParamsState={chatParamsState} setChatParamsState={setChatParamsState} friendRequests={friendRequests} setFriendRequests={setFriendRequests} blockedByUsers={blockedByUsers}/>} />
          <Route path="/profil/:id" element={<Profil socket={socket} friends={friends} setFriends={setFriends} isFriendshipButtonClicked={isFriendshipButtonClicked} setIsFriendshipButtonClicked={setIsFriendshipButtonClicked} chatParamsState={chatParamsState} setChatParamsState={setChatParamsState} friendRequests={friendRequests} setFriendRequests={setFriendRequests} blockedByUsers={blockedByUsers}/>} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Fragment>
  );
}

export default App;