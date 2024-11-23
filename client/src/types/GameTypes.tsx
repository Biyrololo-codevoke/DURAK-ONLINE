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
    };
    taken?: boolean
    from_enemy?: boolean;
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

type UserCards = {
    'me' : CardType[],
    [key : number]: number
}

export type {UserCards}

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

type GameMessage = {
    user_id: number;
    color: 'white' | 'yellow';
    text: string
}

export type {GameMessage}

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
    last_card: GameCard
}

type InitDeck = {
    event: 'init_deck';
    deck: {
        cards: GameCard[]
    }
}

type NextMove = {
    event: 'next';
    victim_player: number;
    walking_player: number;
    throwing_players: number[];
    type?: 'basic' | 'transfer';
    decKeck?: number;
    target: number
}

type PlaceCard = {
    event: 'place_card';
    slot: number;
    card: GameCard
}

type CardBeat = {
    event: 'card_beat';
    card: GameCard;
    slot: number;
    player_id: number;
}

type Bito = {
    event: 'bito';
}

type Take = {
    event: 'take';
}

type Pass = {
    event: 'pass'
}

type PlayerId = {
    player_id: number;
}

type ThrowCard = {
    event: 'throw_card',
    slot: number;
    card: GameCard;
    player_id: number;
}

type Surprise = {
    event: 'surprise';
    cards: GameCard[]
}

type GiveCards = {
    event: 'give_cards';
    player_id: number;
    cards_count: number
}

type GetCards = {
    event: 'get_cards';
    cards: GameCard[]
}

type PlayerTaked = {
    event: 'player_taked';
    player_id: number;
    cards_count: number
}

type PlayerWin = {
    event: 'player_win';
    player_id: number;
    money: number
}

type GameOver = {
    event: 'game_over';
    looser_id: number;
}

type Transfer = {
    event: 'transfer_card';
    card: GameCard
}

type RoomRedirect = {
    event: 'room_redirect';
    new_room_id: number;
    key: string
}

type Leave = {
    event: 'leave';
}

type GameEvent = PlayerConnected | MakeStart | Accept | StartGame |
    InitGame | InitDeck | NextMove | (PlaceCard & {player_id: number}) | CardBeat |
    (Bito & PlayerId) | (Take & PlayerId) | (Pass & PlayerId) | ThrowCard |
    Surprise | GiveCards | GetCards | PlayerTaked | PlayerWin | GameOver | (Transfer & PlayerId) | RoomRedirect | 
    (Leave & PlayerId)

export type {GameEvent}

export type {Bito, Take, Pass}

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
    throwing_players: number[]
}

export type {GamePlayers}

type Reward = {
    x: number;
    y: number;
    money: number;
}

export type {Reward}

type FriendOffer = {
    id: number;
    sender_id: number;
    receiver_id: number;
}

export type {FriendOffer}