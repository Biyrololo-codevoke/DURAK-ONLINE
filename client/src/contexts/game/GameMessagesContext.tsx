import { createContext } from "react";
import { GameMessage } from "types/GameTypes";

const GameMessagesContext = createContext<GameMessage[]>([]);

export default GameMessagesContext