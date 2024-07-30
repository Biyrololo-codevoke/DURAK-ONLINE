import { CARDS_SUITS_BY_SYMBOL } from "constants/GameParams";

type UserShort = {
    id: number | undefined;
}

type CardSuitType = 1 | 2 | 3 | 4;
type CardValueType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

type CardType = {
    suit: CardSuitType;
    value: CardValueType;
    new?: {
        x: number;
        y: number;
    }
}

type GameBoardCard = {
    lower: CardType;
    upper?: CardType;
}

type GameBoardType = {
    cards: GameBoardCard[];
    setCards: React.Dispatch<React.SetStateAction<GameBoardCard[]>>
}

export type {UserShort}

export type {CardSuitType, CardValueType, CardType}

export type {GameBoardCard, GameBoardType}

type GameStateType = 0 | 1 | 2;

export type {GameStateType}

type Timer = {
    id: number;
    color: 'green' | 'red';
    from_start: boolean;
    is_active: boolean;
}

export type {Timer}

type PlayerConnected = {
    event: 'player_connected';
    player_id: number;
}

type MakeStart = {
    event: 'make_start'
}

type Accept = {
    event: 'accept',
    player_id: number;
}

type StartGame = {
    event: 'start_game'
}

type InitGame = {
    event: 'game_init';
    last_card: string;
}

type InitDeck = {
    event: 'init_deck';
    deck: string
}

type NextMove = {
    event: 'next';
    victim_player: number;
    walking_player: number;
    throwing_players: number[]
}

type PlaceCard = {
    event: 'place_card';
    slot: number;
    card: GameCard
}

type GameEvent = PlayerConnected | MakeStart | Accept | StartGame |
    InitGame | InitDeck | NextMove | PlaceCard

export type {GameEvent}

type GameCard = {
    suit: keyof typeof CARDS_SUITS_BY_SYMBOL;
    value: number;
    is_trump: boolean
}

export type {GameCard}

export type {PlaceCard}

type GamePlayers = {
    walking: number;
    victim: number;
}

export type {GamePlayers}