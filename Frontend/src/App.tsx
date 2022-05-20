import React, { Fragment } from 'react';
import { useState, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Login from './pages/Login';
import Profil from './pages/Profil';
import axios from 'axios';
import Login2FA from './pages/Login2FA';
import './pages/Home.css';
import './pages/Login.css';
import './pages/Home.css';
import './pages/Login.css';
import './pages/Profil.css';
import './pages/Login2FA.css'
import './pages/404NotFound.css'
import './App.css'
import NotFound from './pages/404NotFound';
import ProtectedRoute from './protectedRoute';
import Loader from './components/Loader';


const App = () => {
  const [isAuth, setIsAuth] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  if (!isAuth) {
    axios.get(`http://${process.env.REACT_APP_HOST || "localhost"}:8000/api/users/me`, { withCredentials: true })
			.then(res => {
				setIsAuth(true)
        setIsLoading(false)
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
          <Route path="/login" element={<Login isAuth={isAuth}/>} />
          <Route path="/profil/:id" element={<Profil isAuth={isAuth}/>} />
        </Route>
        <Route path="*" element={<NotFound />} />
  
      </Routes>
      
    </Fragment>
  );
}

export default App;