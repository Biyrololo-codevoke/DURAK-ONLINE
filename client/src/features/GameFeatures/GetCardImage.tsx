import { CardType } from "types/GameTypes";

export default function getCardImage(card: CardType) : string {
    let suit = card.suit;
    let value = card.value + 1 - 1;
    if(value === 14){
        value = 1;
    }
    return `/static/cards/${suit}_${value}.png`
} 