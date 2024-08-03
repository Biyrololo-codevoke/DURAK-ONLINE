import { createContext } from "react";
import { GamePlayers } from "types/GameTypes";

const GamePlayersContext = createContext<GamePlayers>(
    {
        walking: -1,
        victim: -1,
        throwing_players: []
    }
)

export default GamePlayersContext