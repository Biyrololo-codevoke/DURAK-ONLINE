import { IconButton, Typography } from "@mui/material";
import { AllIcon, DrawableIcon, FirstSpeedIcon, LoseIcon, OnlyNeighborsIcon, PerevodnoiIcon, PodkidnoiIcon, SecondSpeedIcon, TextIcon } from "./Icons";
import './Filters.css';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';

import { PRICES_LABELS } from "constants/Prices";

import * as React from 'react';

export default function FilterPreview(){

    const navigate = useNavigate();

    function handleOpenFilters(){
        navigate('/filters');
    }

    const prices : [number, number] = JSON.parse(localStorage.getItem('prices') || '[1, 16]');

    const players_count : number[] = JSON.parse(localStorage.getItem('players_count') || '[2, 3, 4, 5, 6]');

    const cards_count : number[] = JSON.parse(localStorage.getItem('cards_count') || '[24, 36, 52]');

    const game_speed : number[] = JSON.parse(localStorage.getItem('game_speed') || '[1, 2]');

    const is_transfering = parseInt(localStorage.getItem('is_transfering') || '3');

    const all_tossing = parseInt(localStorage.getItem('all_tossing') || '3');

    const is_classic = parseInt(localStorage.getItem('is_classic') || '3');

    return (
        <div id="filter-preview" onClick={handleOpenFilters}>
            <center>
                <Typography variant="h5" component="span" style={{color: '#FFFFFF'}}>
                    Настройки фильтров
                </Typography>
            </center>
            <section id="filter-preview-container">
                <div id="filter-game-settings">
                    <section className="filter-row">
                        <PodkidnoiIcon disabled={is_transfering === 2}/>
                        <OnlyNeighborsIcon disabled={all_tossing === 2}/>
                        <LoseIcon disabled={is_classic === 2}/>
                        <FirstSpeedIcon disabled={!game_speed.includes(1)}/>
                        <SecondSpeedIcon disabled={!game_speed.includes(2)}/>
                    </section>
                    <section className="filter-row">
                        <PerevodnoiIcon disabled={is_transfering === 1}/>
                        <AllIcon disabled={all_tossing === 1}/>
                        <DrawableIcon disabled={is_classic === 1}/>
                        <TextIcon text="24" disabled={!cards_count.includes(24)}/>
                        <TextIcon text="36" disabled={!cards_count.includes(36)}/>
                        <TextIcon text="52" disabled={!cards_count.includes(52)}/>
                    </section>
                </div>
                <div id="filter-main-settings">
                    <section className="d-flex ai-center g-5">
                        <Typography
                            variant="subtitle2"
                            component="span"
                            style={{color: '#DDDDDD'}}
                        >
                            {PRICES_LABELS[prices[0]]} - {PRICES_LABELS[prices[1]]}
                        </Typography>
                        <img src="/static/currency.png" alt="currency" className='currency' style={{width: '20px'}}/>
                    </section>
                    <section className="d-flex ai-center g-5">
                        <Typography
                            variant="subtitle2"
                            component="span"
                            style={{color: '#DDDDDD'}}
                        >
                            {
                                players_count.map((value, index) => {
                                    if(index === 0) return <React.Fragment key={value}>{value}</React.Fragment>;

                                    return <React.Fragment key={value}>, {value}</React.Fragment>;
                                })
                            }
                        </Typography>
                        <PersonOutlineIcon style={{color: '#DDDDDD'}}/>
                    </section>
                </div>
                <IconButton 
                style=
                {{
                    backgroundColor: 'rgb(58, 99, 146, .3)', 
                    color: 'white',
                    boxShadow: 'rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px',
                    margin: 'auto 10px auto 0',
                }}>
                    <NavigateNextIcon/>
                </IconButton>
            </section>
        </div>
    )
}