import { createContext } from "react";
import { GameBoardType } from "types/GameTypes";

const GameBoardContext = createContext<GameBoardType>(
    {
        cards: [], 
        setCards: () => {},
    }
);

export default GameBoardContext