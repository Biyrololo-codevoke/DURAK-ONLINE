import { Typography } from '@mui/material';
import {numberWithSpaces} from 'features';

export default function PlayerMoney(){
    return (
        <div id='player-money'>
            <Typography variant="h4" color="error">
                {numberWithSpaces(1234567)}
            </Typography>
            <img src="/static/currency.png" alt="currency" className='currency'/>
        </div>
    )
}