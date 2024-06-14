import { Typography } from '@mui/material'
import {FilterPreview} from 'components/GameFilters'
import { RoomsList } from 'components/RoomsList'

export default function OpenGamesPage() {
    return (
        <main>
            <center className="bs-border-box bg-white p-10">
                <Typography 
                variant="h4" 
                component="span" 
                style={{color: '#818181'}}
                >
                    Открытые игры
                </Typography>
            </center>
            <FilterPreview />
            <RoomsList />
        </main>
    )
}