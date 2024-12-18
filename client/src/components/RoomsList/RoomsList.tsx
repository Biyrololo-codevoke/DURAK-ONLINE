import { useEffect, useState } from "react"
import { Room } from "types/Room"
import RoomComponent from "./Room";
import './Rooms.css'
import { PRICES } from "constants/Prices";
import { roomListWS } from "constants/ApiUrls";
import Cookies from 'js-cookie';
import {Api as Types} from 'types'
import { useNavigate } from "react-router-dom";
import handle_message from "features/RoomList/handleEvents";
import joinRoom from "features/RoomList/JoiningRoom";
import { Typography } from "@mui/material";

export default function RoomsList(){

    const navigate = useNavigate();

    const [rooms, setRooms] = useState<Room[]>([]);

    const [socket, setSocket] = useState<WebSocket | null>(null);

    function _handle_message(data: Types.RoomListResponseType |
        Types.RoomListStatusType |
        Types.RoomListEvent |
        Types.RoomListJoinEventType
        ){
        handle_message(data, navigate, rooms, setRooms)
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
                event: 'auth',
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

    function handle_join_room(room_id: number){
        joinRoom(socket, room_id)
    }

    // filter start

    const prices : [number, number] = JSON.parse(localStorage.getItem('prices') || '[1, 16]');

    const players_count : number[] = JSON.parse(localStorage.getItem('players_count') || '[2, 3, 4, 5, 6]');

    const cards_count : number[] = JSON.parse(localStorage.getItem('cards_count') || '[24, 36, 52]');

    const game_speed : number[] = JSON.parse(localStorage.getItem('game_speed') || '[1, 2]');

    const is_transfering = parseInt(localStorage.getItem('is_transfering') || '3');

    const all_tossing = parseInt(localStorage.getItem('all_tossing') || '3');

    const is_classic = parseInt(localStorage.getItem('is_classic') || '3');

    function filter_rooms(){
        let filtered_rooms : Room[] = rooms;

        // filter by price

        filtered_rooms = filtered_rooms.filter(
            (room) => room.game_price >= PRICES[prices[0]] && room.game_price <= PRICES[prices[1]]
        );

        // filter by cards count

        filtered_rooms = filtered_rooms.filter(
            (room) => cards_count.includes(room.cards_count)
        );


        // filter by players count

        filtered_rooms = filtered_rooms.filter(
            (room) => players_count.includes(room.players_count)
        );

        // filter by game speed

        filtered_rooms = filtered_rooms.filter(
            (room) =>  game_speed.includes(room.game_speed)
        );

        // filter by transfering

        if(is_transfering === 1){
            filtered_rooms = filtered_rooms.filter(
                (room) => room.is_transfering
            );
        }
        if(is_transfering === 2){
            filtered_rooms = filtered_rooms.filter(
                (room) => !room.is_transfering
            );
        }

        // filter by all_tossing

        if(all_tossing === 1){
            filtered_rooms = filtered_rooms.filter(
                (room) => room.all_tossing
            );
        }
        if(all_tossing === 2){
            filtered_rooms = filtered_rooms.filter(
                (room) => !room.all_tossing
            );
        }

        // filter by classic

        if(is_classic === 1){
            filtered_rooms = filtered_rooms.filter(
                (room) => room.is_classic
            );
        }
        if(is_classic === 2){
            filtered_rooms = filtered_rooms.filter(
                (room) => !room.is_classic
            );
        }

        return filtered_rooms;
    }

    const filtered_rooms = filter_rooms();

    // filter end

    return (
        <div id="rooms-list">
            {
                filtered_rooms.map(
                    (room) => (
                        <RoomComponent
                            key={room.id}
                            {...room}
                            onClick={handle_join_room}
                        />
                    )
                )
            }
            {
                filtered_rooms.length === 0 && (
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
    )
}