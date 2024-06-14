import { Slider, Typography } from "@mui/material";
import numberWithSpaces from "features/NumberWithSpaces";
import { useState } from "react";
import { PRICES_LABELS } from "constants/Prices";

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

    const [value, setValue] = useState<[number, number]>(JSON.parse(localStorage.getItem('prices') || '[1, 16]') as [number, number]);

    return (
        <div id="game-price-container">
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
                    if(Array.isArray(newValue)){
                        setValue(newValue as [number, number]);
                        localStorage.setItem('prices', `[${newValue[0]}, ${newValue[1]}]`);
                    }
                }}
                color="error"
                />
            </div>
        </div>
    )
}