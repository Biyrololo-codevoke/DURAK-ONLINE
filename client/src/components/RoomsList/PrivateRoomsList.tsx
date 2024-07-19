import { useState } from "react"
import { Room } from "types/Room"
import RoomComponent from "./Room";
import './Rooms.css'
import PrivateRoomComponent from "./PrivateRoom";
import PasswordDialog from "./PasswordDialog";

export default function PrivateRoomsList(){

    const [room_id, setRoomId] = useState<number | null>(null);

    const [rooms, setRooms] = useState<Room[]>([
        {
            id: 1,
            game_price: 25000,
            currcent_player_count: 3,
            players_count: 5,
            cards_count: 24,
            game_speed: 1,
            is_transfering: false,
            all_tossing: true,
            is_classic: true,
            title: 'бакл, хорош, yes',
            is_private: true
        },
        {
            id: 2,
            game_price: 100000,
            players_count: 6,
            currcent_player_count: 5,
            cards_count: 52,
            game_speed: 2,
            is_transfering: true,
            all_tossing: true,
            is_classic: false,
            title: 'SNAKE, капибара, игорь, ***, айайай',
            is_private: true
            
        },
        {
            id: 3,
            game_price: 50000,
            players_count: 5,
            currcent_player_count: 4,
            cards_count: 32,
            game_speed: 1,
            is_transfering: true,
            all_tossing: false,
            is_classic: true,
            title: 'Рандомные, ники, чтобы, были',
            is_private: true
        },
        {
            id: 4,
            game_price: 500000,
            players_count: 6,
            currcent_player_count: 6,
            cards_count: 52,
            game_speed: 2,
            is_transfering: true,
            all_tossing: true,
            is_classic: true,
            title: 'Четыре, слова, вместо, Ников, а нет, Шесть',
            is_private: true
        }
    ]);

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
            </div>
            <PasswordDialog room_id={room_id} setRoomId={setRoomId}/>

        </>
    )
}