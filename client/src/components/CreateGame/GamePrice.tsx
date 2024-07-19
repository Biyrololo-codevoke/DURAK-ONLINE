import { Slider, Typography } from "@mui/material";
import numberWithSpaces from "features/NumberWithSpaces";
import { useState } from "react";
import { PRICES_LABELS, PRICES } from "constants/Prices";
import {CreatingGameContext} from 'contexts' 

import { useContext } from "react";

const marks : { value: number; label: string }[] = [
    {
        value: 1,
        label: '100',
    },
    {
        value: 2,
        label: '', // 250
    },
    {
        value: 3,
        label: '', //500
    },
    {
        value: 4,
        label: '1К',
    },
    {
        value: 5,
        label: '', // 2.5K
    },
    {
        value: 6,
        label: '', // 5K
    },
    {
        value: 7,
        label: '10К',
    },
    {
        value: 8,
        label: '', // 25K
    },
    {
        value: 9,
        label: '', //50К
    },
    {
        value: 10,
        label: '100К',
    },
    {
        value: 11,
        label: '', // 250К
    },
    {
        value: 12,
        label: '', // 500К
    },
    {
        value: 13,
        label: '1М',
    },
    {
        value: 14,
        label: '', // 2.5М
    },
    {
        value: 15,
        label: '', // 5М
    },
    {
        value: 16,
        label: '10М',
    }
]

export default function GamePrice(){

    const {setGamePrice} = useContext(CreatingGameContext);

    const [value, setValue] = useState(marks[0].value);

    return (
        <div id="game-price-container">
            <section className="d-flex jc-space-between">
                <Typography variant="h5" component="span" style={{color: '#FFFFFF'}}>Ваша ставка</Typography>
                <div className="d-flex g-15">
                    <Typography variant="h4" style={{color: '#FFFFFF'}}>
                        {PRICES_LABELS[value]}
                    </Typography>
                    <img src="/static/currency.png" alt="currency" className='currency'/>
                </div>
            </section>
            <div id="game-price">
                <Slider
                min={marks[0].value}
                max={marks[marks.length - 1].value}
                marks={marks}
                sx={
                    {
                        '& .MuiSlider-markLabel': {
                            fontSize: '20px',
                        }
                    }
                }
                style={
                    {
                        height: '15px',
                    }
                }
                value={value}
                onChange={(event, newValue) => {
                    if(typeof newValue === 'number'){
                        setValue(newValue);
                        setGamePrice(PRICES[newValue]);
                    }
                }}
                />
            </div>
        </div>
    )
}