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
import NotFound from './pages/404NotFound';

function App() {
  return (
    <Fragment>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-2FA" element={<Login2FA />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Fragment>
  );
}

export default App;