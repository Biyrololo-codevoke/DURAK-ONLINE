import axios from "axios";
import { Room } from "types/Room";

import {getRoomInfo} from "constants/ApiUrls";
import { CreateRoomRequestType } from "types/ApiTypes";

export function handleAddRoom(room_id : number, setter : React.Dispatch<React.SetStateAction<Room[]>>) {
    const url = getRoomInfo(room_id);

    axios
        .get(url)
        .then((response) => {
            const room : CreateRoomRequestType & {user_ids: number[], name: string, id: number}= response.data.room;

            const c_room : Room = {
                id: room.id,
                title: room.name,
                currcent_player_count: room.user_ids.length,
                players_count: 4, // max players count TODO
                cards_count: room.cards_count,
                game_speed: room.speed,
                is_transfering: room.game_type === 'translate',
                all_tossing: room.throw_type === 'all',
                is_classic: room.win_type === 'classic',
                is_private: room.private,
                game_price: room.reward
            }

            setter((prev) => {
                const found = prev.find((room) => room.id === c_room.id);

                if (found) {
                    return prev.map((room) => {
                        if (room.id === c_room.id) {
                            return c_room;
                        }
                        return room;
                    });
                }

                return [...prev, c_room];
            });
        })
        .catch((error) => {
            console.error(error);
        });
}

export default function handleAddRooms(room_ids : number[], setter : React.Dispatch<React.SetStateAction<Room[]>>) {
    room_ids.forEach((room_id) => {
        handleAddRoom(room_id, setter);
    });
}