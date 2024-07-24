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