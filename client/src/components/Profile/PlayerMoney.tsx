import { Typography } from '@mui/material';
import {numberWithSpaces} from 'features';

export default function PlayerMoney(){

    const money = parseInt(localStorage.getItem('player_money') || '100');

    return (
        <div id='player-money'>
            <Typography variant="h4" color="error">
                {numberWithSpaces(money)}
            </Typography>
            <img src="/static/currency.png" alt="currency" className='currency'/>
        </div>
    )
}