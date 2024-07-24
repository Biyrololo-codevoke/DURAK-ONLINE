import { createContext } from "react";
import { GameStateType } from "types/GameTypes";

const GameStateContext = createContext<GameStateType>(
    0
);

export default GameStateContext