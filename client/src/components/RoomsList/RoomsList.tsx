import { useState } from "react"
import { Room } from "types/Room"
import RoomComponent from "./Room";
import './Rooms.css'
import { PRICES } from "constants/Prices";

export default function RoomsList(){

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
            is_private: false
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
            is_private: false
            
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
            is_private: false
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
            is_private: false
        }
    ]);

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

    return (
        <div id="rooms-list">
            {
                filtered_rooms.map(
                    (room) => (
                        <RoomComponent
                            key={room.id}
                            {...room}
                        />
                    )
                )
            }
        </div>
    )
}