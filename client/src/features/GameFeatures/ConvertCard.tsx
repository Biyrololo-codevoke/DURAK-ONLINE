import { CARDS_SUITS_BY_SYMBOL } from "constants/GameParams";
import { CardSuitType, CardType, CardValueType, GameCard } from "types/GameTypes";

export default function convert_card(card: GameCard) : CardType {
    
    const suit = CARDS_SUITS_BY_SYMBOL[card.suit];
    
    const _card : CardType = {
        suit: suit as CardSuitType,
        value: card.value as CardValueType
    }

    return _card;
}