import React from 'react';
import { useState, useEffect } from 'react';
import { Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import MainPage from './pages/MainPage';
import Profil from './pages/Profil';
import axios from 'axios';
import Login2FA from './pages/Login2FA';
import './pages/Home.css';
import './pages/MainPage.css';
import './pages/Home.css';
import './pages/Profil.css';
import './pages/Login2FA.css'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mainpage" element={<MainPage />} />
        <Route path="/login-2FA" element={<Login2FA />} />
        <Route path="/profil/:id" element={<Profil />} />
      </Routes>
    </div>
  );
}

export default App;