import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import './Main.css';
import axios from 'axios';
import { RegisterPage, LoginPage, ProfilePage, CreateGamePage, OpenGamesPage, DefaultPage } from 'pages';
import {SettingsPage} from 'pages';
import { GamePage, ConnectingPage } from 'pages';
import { GameFiltersPage, PrivateGamesPage } from 'pages';
import Footer from 'components/Footer/Footer';
import {isMobile} from 'react-device-detect';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Cookies from 'js-cookie';
import { useEffect } from 'react';

function App() {

  axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

  if(isMobile){
    document.body.id = 'mobile-view';
  }

  useEffect(
    ()=>{
      const access_token = Cookies.get('access_token');
      if(access_token){
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      }
    },
    []
  )

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" Component={DefaultPage} />
          <Route path="/register" Component={RegisterPage} />
          <Route path="/login" Component={LoginPage} />
          <Route path="/profile" Component={ProfilePage} />
          <Route path="/settings" Component={SettingsPage} />
          <Route path="/create-game" Component={CreateGamePage} />
          <Route path="/open" Component={OpenGamesPage} />
          <Route path="/filters" Component={GameFiltersPage} />
          <Route path="/private" Component={PrivateGamesPage} />
          <Route path="/game" Component={GamePage} />
          <Route path="/game/:room_id" Component={ConnectingPage} />
        </Routes>
        <Footer />
      </BrowserRouter>
      <ToastContainer 
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"/> 
    </>
  );
}

export default App;
