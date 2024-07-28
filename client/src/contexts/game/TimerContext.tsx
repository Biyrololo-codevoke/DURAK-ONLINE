import { createContext } from "react";
import { Timer } from "types/GameTypes";

type ContextType = {
    timer_update: number;
    timers: Timer[]
}

const TimerContext = createContext<ContextType>({
    timer_update: 0,
    timers: []
})

export default TimerContext