import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import './Main.css';
import axios from 'axios';
import { RegisterPage, LoginPage, ProfilePage, CreateGamePage, OpenGamesPage, DefaultPage, FriendsPage, SearchFriendPage } from 'pages';
import {SettingsPage, ConfirmEmailPage} from 'pages';
import { GamePage, ConnectingPage } from 'pages';
import { GameFiltersPage, PrivateGamesPage } from 'pages';
import Footer from 'components/Footer/Footer';
import {isMobile} from 'react-device-detect';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Cookies from 'js-cookie';
import { useEffect, useInsertionEffect } from 'react';
import { GetUserPhotoResponseType, GetUserResponseType } from 'types/ApiTypes';
import {Protected} from 'hocs';
import { useState } from 'react';
import getAllResources from 'features/getAllResources';
import { LinearProgress, Typography } from '@mui/material';
import RulesPage from 'pages/RulesPage';
import NewsPage from 'pages/NewsPage';

const LOGIN_PAGES_URLS = ['/login', '/register']

function App() {

  const [loaded_cnt, set_loaded_cnt] = useState(0);
  
  const sources = getAllResources();
  
  const is_loaded = loaded_cnt === sources.length;
  useEffect(
    ()=>{
        for(let src of sources){
          let img = new Image();
          img.src = src;
          img.onload = function (){
            let full = false;
            set_loaded_cnt(prev => prev + 1)
          }
        }
    },
    []
  )

  // axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;
  axios.defaults.baseURL = '/api'; //https://codevoke.ru/api
  axios.defaults.baseURL = 'http://127.0.0.1:5000/api'

  if(isMobile){
    document.body.id = 'mobile-view';
  }

  useEffect(
    ()=>{
      const access_token = Cookies.get('access_token');
      if(access_token){
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      }

      const user_id = localStorage.getItem('user_id');
      if(!user_id){
        Cookies.remove('access_token');
        const clearing_keys = ['username', 'verified', 'user_id', 'image_id', 'player_money', 'user_photo'];
        clearing_keys.forEach(key => localStorage.removeItem(key));
        if(!LOGIN_PAGES_URLS.includes(window.location.pathname)){
          window.location.pathname = '/login'
        }
        return;
      }

      axios.get(`/user?id=${user_id}`)
      .then(
        res=>{
          const data : GetUserResponseType = res.data;
          localStorage.setItem('username', data.user.username);
          localStorage.setItem('verified', `${data.user.verified}`);
          localStorage.setItem('user_id', `${data.user.id}`);
          localStorage.setItem('image_id', `${data.user.image_id}`);
          localStorage.setItem('player_money', `${data.user.money}`);
          if(data.user.image_id === null){
            localStorage.removeItem('user_photo');
          }
          else{
            localStorage.setItem('user_photo', `/api/image/${data.user.image_id}`);
          }
        }
      )
      .catch(
        err=>{
          console.log(err);
          localStorage.removeItem('user_id');
          localStorage.removeItem('username');
          localStorage.removeItem('verified');
          localStorage.removeItem('image_id');
          localStorage.removeItem('player_money');
          localStorage.removeItem('user_photo');
          Cookies.remove('access_token');
          axios.defaults.headers.common['Authorization'] = '';
          if(!LOGIN_PAGES_URLS.includes(window.location.pathname)){
            window.location.pathname = '/login'
          }
            
        }
      )
    },
    []
  )

  
  if(!is_loaded){
    const value = Math.floor(loaded_cnt / sources.length * 100);
    return (
      <>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={
              <div id="loading">
                <Typography id="loading__title">
                  DURAK ONLINE
                </Typography>
                <LinearProgress variant="determinate" value={value} color='secondary' sx={{width: '100%'}}/>
              </div>
            } />
          </Routes>
        </BrowserRouter>
      </>
    )
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="*" Component={DefaultPage} />
          <Route path="/register" Component={RegisterPage} />
          <Route path="/login" Component={LoginPage} />
          <Route path='/rules' Component={RulesPage} />
          <Route path='/news' Component={NewsPage} />
          <Route path="/profile" element={
            <Protected>
              <ProfilePage/>
            </Protected>
          } />
          <Route path="/settings" element={
            <Protected>
              <SettingsPage/>
            </Protected>
          } />
          <Route path="/create-game" element={
            <Protected>
              <CreateGamePage/>
            </Protected>
          } />
          <Route path="/open" element={
            <Protected>
              <OpenGamesPage/>
            </Protected>
          } />
          <Route path="/filters" element={
            <Protected>
              <GameFiltersPage/>
            </Protected>
          } />
          <Route path="/private" element={
            <Protected>
              <PrivateGamesPage/>
            </Protected>
          } />
          <Route path="/game" element={
            <Protected>
              <GamePage/>
            </Protected>
          } />
          <Route path="/game/:room_id" element={
            <Protected>
              <ConnectingPage/>
            </Protected>
          } />
          <Route path="/confirm-email" element={
            <Protected>
              <ConfirmEmailPage/>
            </Protected>
          } />
          <Route path="/friends" element={
            <Protected>
              <FriendsPage />
            </Protected>
          } />
          <Route path="/search-friends" element={
            <Protected>
              <SearchFriendPage />
            </Protected>
          } />
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
