import { useState, useEffect } from "react"
import { Room } from "types/Room"
import RoomComponent from "./Room";
import './Rooms.css'
import PrivateRoomComponent from "./PrivateRoom";
import PasswordDialog from "./PasswordDialog";
import { roomListWS } from "constants/ApiUrls";
import Cookies from 'js-cookie';
import {Api as Types} from 'types'
import handleAddRooms from "features/RoomList/handleAddRoom";
import handle_message from "features/RoomList/handleEvents";
import { useNavigate } from "react-router-dom";
import joinRoom from "features/RoomList/JoiningRoom";
import { Typography } from "@mui/material";

export default function PrivateRoomsList(){

    const navigate = useNavigate();

    const [room_id, setRoomId] = useState<number | null>(null);

    const [rooms, setRooms] = useState<Room[]>([
        // {
        //     id: 1,
        //     game_price: 25000,
        //     currcent_player_count: 3,
        //     players_count: 5,
        //     cards_count: 24,
        //     game_speed: 1,
        //     is_transfering: false,
        //     all_tossing: true,
        //     is_classic: true,
        //     title: 'бакл, хорош, yes',
        //     is_private: true
        // },
        // {
        //     id: 2,
        //     game_price: 100000,
        //     players_count: 6,
        //     currcent_player_count: 5,
        //     cards_count: 52,
        //     game_speed: 2,
        //     is_transfering: true,
        //     all_tossing: true,
        //     is_classic: false,
        //     title: 'SNAKE, капибара, игорь, ***, айайай',
        //     is_private: true
            
        // },
        // {
        //     id: 3,
        //     game_price: 50000,
        //     players_count: 5,
        //     currcent_player_count: 4,
        //     cards_count: 32,
        //     game_speed: 1,
        //     is_transfering: true,
        //     all_tossing: false,
        //     is_classic: true,
        //     title: 'Рандомные, ники, чтобы, были',
        //     is_private: true
        // },
        // {
        //     id: 4,
        //     game_price: 500000,
        //     players_count: 6,
        //     currcent_player_count: 6,
        //     cards_count: 52,
        //     game_speed: 2,
        //     is_transfering: true,
        //     all_tossing: true,
        //     is_classic: true,
        //     title: 'Четыре, слова, вместо, Ников, а нет, Шесть',
        //     is_private: true
        // }
    ]);
    
    const [socket, setSocket] = useState<WebSocket | null>(null);

    function _handle_message(data: Types.RoomListResponseType |
        Types.RoomListStatusType |
        Types.RoomListEvent
        ){
        handle_message(
            data,
            navigate,
            rooms,
            setRooms,
            false // are games open
        )
    }

    // init ws
    
    useEffect(() => {
        const new_socket = new WebSocket(roomListWS());
        
        new_socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            _handle_message(data);
        }

        new_socket.onopen = () => {
            const _data = JSON.stringify({
                access_token: Cookies.get('access_token'),
            })
            new_socket.send(_data);
        }

        setSocket(new_socket);

        return () => {
            if(new_socket.readyState === 1){
                new_socket.close(1000);
            }
        }

    }, [])

    function handle_join_room(password: string){
        if(!password || room_id === null) return
        joinRoom(socket, room_id, password);
    }

    return (
        <>
            <div id="rooms-list">
                {
                    rooms.map(
                        (room) => (
                            <PrivateRoomComponent
                                key={room.id}
                                join={(id) => setRoomId(id)}
                                {...room}
                            />
                        )
                    )
                }
                {
                    rooms.length === 0 && (
                    <center style={{margin: '25px 0 0 0'}}>
                        <Typography
                            variant="h6"
                            component="span"
                            sx={{ color: 'white'}}
                        >
                            Нет доступных комнат
                        </Typography>
                    </center>
                )
            }
            </div>
            <PasswordDialog room_id={room_id} setRoomId={setRoomId} onSubmit={handle_join_room}/>

        </>
    )
}