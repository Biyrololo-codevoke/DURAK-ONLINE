import { PRICES } from "constants/Prices";
import { createContext } from "react";

type ContextType = {
    players_count: number[]
    setPlayersCount: React.Dispatch<React.SetStateAction<number[]>>
    cards_count: number[];
    setCardsCount: React.Dispatch<React.SetStateAction<number[]>>
    game_speed: number[];
    setGameSpeed: React.Dispatch<React.SetStateAction<number[]>>;
    is_transfering: number;
    setIsTransfering: React.Dispatch<React.SetStateAction<number>>;
    all_tossing: number;
    setAllTossing: React.Dispatch<React.SetStateAction<number>>;
    is_classic: number;
    setIsClassic: React.Dispatch<React.SetStateAction<number>>;
}

const GameFilterContext = createContext<ContextType>({

    players_count: [2],
    setPlayersCount: () => {},
    cards_count: [32],
    setCardsCount: () => {},
    game_speed: [1],
    setGameSpeed: () => {},
    is_transfering: 0,
    setIsTransfering: () => {},
    all_tossing: 0,
    setAllTossing: () => {},
    is_classic: 0,
    setIsClassic: () => {},
});

type CreatingGameContextType = {
    game_price: number;
    setGamePrice: React.Dispatch<React.SetStateAction<number>>
    players_count: number
    setPlayersCount: React.Dispatch<React.SetStateAction<number>>
    cards_count: number;
    setCardsCount: React.Dispatch<React.SetStateAction<number>>
    game_speed: 1 | 2;
    setGameSpeed: React.Dispatch<React.SetStateAction<1 | 2>>;
    is_transfering: boolean;
    setIsTransfering: React.Dispatch<React.SetStateAction<boolean>>;
    all_tossing: boolean;
    setAllTossing: React.Dispatch<React.SetStateAction<boolean>>;
    is_classic: boolean;
    setIsClassic: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreatingGameContext = createContext<CreatingGameContextType>({
    game_price: PRICES[1],
    setGamePrice: () => {},
    players_count: 2,
    setPlayersCount: () => {},
    cards_count: 32,
    setCardsCount: () => {},
    game_speed: 1,
    setGameSpeed: () => {},
    is_transfering: false,
    setIsTransfering: () => {},
    all_tossing: false,
    setAllTossing: () => {},
    is_classic: true,
    setIsClassic: () => {},
});

export {CreatingGameContext}

export default GameFilterContext