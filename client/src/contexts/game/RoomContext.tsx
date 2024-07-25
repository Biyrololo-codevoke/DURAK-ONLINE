import { createContext } from "react";
import { RoomResponseType } from "types/ApiTypes";

const RoomContext = createContext<RoomResponseType>({
    reward: 0,
    players_count: 1,
    cards_count: 24,
    speed: 1,
    name: '',
    game_type: 'throw',
    throw_type: 'all',
    win_type: 'classic',
    private: false,
    user_ids: []
})

export default RoomContext