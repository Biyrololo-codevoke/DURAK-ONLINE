import { Typography } from '@mui/material'
import PrivateRoomsList from 'components/RoomsList/PrivateRoomsList'

export default function PrivateGamesPage(){
    return (
        <main>
            <center className="bs-border-box bg-white p-10">
                <Typography 
                variant="h4" 
                component="span" 
                style={{color: '#818181'}}
                >
                    Приватные игры
                </Typography>
            </center>
            <PrivateRoomsList />
        </main>
    )
}