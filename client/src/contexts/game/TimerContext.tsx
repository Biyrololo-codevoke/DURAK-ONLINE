import { createContext } from "react";
import { Timer } from "types/GameTypes";

type ContextType = {
    timer_update: number;
    timers: Timer[];
    left_players: number[]
}

const TimerContext = createContext<ContextType>({
    timer_update: 0,
    timers: [],
    left_players: []
})

export default TimerContext