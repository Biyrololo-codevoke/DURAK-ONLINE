import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';

import './Footer.css';

const HIDE_FOOTER_URLS = ['/login', '/register', '/game'];

const URLS = ['/profile', '/open', '/private', '/create-game'];

const StyledBottomNavigationAction = styled(BottomNavigationAction)(
    {
        color: 'black',
        '&.Mui-selected': {
            color: '#A83244',
            '& span': {
                fontSize: '0.75rem',
            },
            '& .footer-img':{
                opacity: '1',
            }
        },
    }
)

export default function Footer(){
    
    const location = useLocation();
    const navigate = useNavigate();

    const [value, setValue] = useState(URLS.indexOf(window.location.pathname));

    if(HIDE_FOOTER_URLS.includes(location.pathname)){
        return null;
    }

    function handleNavigate(where: string){
        if(where !== location.pathname){
            navigate(where);
        }
    }

    return (
        <footer>
            <BottomNavigation
                showLabels
                value={value}
                onChange={(event, newValue) => {
                    setValue(newValue);
                    handleNavigate(URLS[newValue]);
                }}
                sx={
                    {
                        backgroundColor: 'white',
                        height: 84
                    }
                }
            >
                <StyledBottomNavigationAction label="Профиль" icon={<TrefIcon />}/>
                <StyledBottomNavigationAction label="Открытые" icon={<HeartIcon />} />
                <StyledBottomNavigationAction label="Приватные" icon={<CherviIcon />} />
                <StyledBottomNavigationAction label="Создать игру" icon={<RubyIcon />} />
            </BottomNavigation>
        </footer>
    )

}

function CherviIcon(){

    return (
        <div
        className='footer-img-container'
        >
            <img src="/static/chervi.png" alt="chervi" className='footer-img' style={{width: '55px', top: '-13px', left: '-15.5px'}}/>
            <LockIcon className='footer-icon' style={{color: 'white'}}/>
        </div>
    )
}

function HeartIcon(){

    return (
        <div
        className='footer-img-container'
        >
            <img src="/static/serdce.png" alt="heart" className='footer-img' style={{width: '50px', top: '-8px', left: '-13px'}}/>
            <SearchIcon className='footer-icon' style={{color: 'white'}}/>
        </div>
    )
}

function TrefIcon(){

    return (
        <div
        className='footer-img-container'
        >
            <img src="/static/tref.png" alt="tref" className='footer-img' style={{top: '-10px', left: '-18.5px'}}/>
            <PermIdentityIcon className='footer-icon' style={{color: 'white'}}/>
        </div>
    )
}

function RubyIcon(){

    return (
        <div
        className='footer-img-container ruby-container'
        >
            <img src="/static/ruby.png" alt="ruby" className='footer-img ruby-icon' style={{width: '50px', top: '-13px', left: '-13px'}}/>
            <AddIcon className='footer-icon ruby-text-icon' style={{color: 'white'}}/>
        </div>
    )
}