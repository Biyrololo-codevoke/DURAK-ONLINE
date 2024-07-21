import React from "react";
import { Room } from "types/Room";
import * as Types from 'types/ApiTypes'
import handleAddRooms from "features/RoomList/handleAddRoom";

function handle_message(data: Types.RoomListResponseType |
    Types.RoomListStatusType |
    Types.RoomListEvent |
    Types.RoomListJoinEventType,
    navigate: (path: string) => void,
    rooms: Room[],
    setRooms: React.Dispatch<React.SetStateAction<Room[]>>,
    are_open_games = true
    ){
    console.log(data);

    if('key' in data){
        localStorage.setItem('_game_key', String(data.key))
        navigate(`/game`)
    }
    else if('status' in data){
        // ...
    }
    else{
        const rooms_ids = Object.keys(data).filter(key => key !== 'type').map(key => parseInt(key));

        if('type' in data && data.type === 'delete_room'){
            // delete Rooms
            setRooms(rooms.filter((room) => !rooms_ids.includes(room.id)));
            return
        }

        // new Rooms or create Rooms or update Rooms

        handleAddRooms(rooms_ids, setRooms, are_open_games);
    }
}

export default handle_message;