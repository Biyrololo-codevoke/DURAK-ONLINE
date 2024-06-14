import { Typography } from '@mui/material'
import GameSettings from 'components/GameFilters/GameSettings'
import GameVariants from 'components/GameFilters/GameVariants'
import GamePrice from 'components/GameFilters/Price'
export default function GameFiltersPage(){
    return (
        <main>
            <center className="bs-border-box bg-white p-10">
                <Typography 
                variant="h4" 
                component="span" 
                style={{color: '#818181'}}
                >
                    Фильтры
                </Typography>
            </center>
            <GamePrice />
            <GameSettings />
            <GameVariants />
        </main>
    )
}