import { CardType } from "types/GameTypes";

function can_i_beat(lower: CardType, upper: CardType) : boolean{

    let trump_suit = parseInt(localStorage.getItem('trump_suit') || '-1');

    if(lower.suit === trump_suit){
        if(upper.suit !== trump_suit){
            return false;
        }

        return upper.value > lower.value
    }

    if(upper.suit === trump_suit) return true;

    return (upper.suit === lower.suit) && (upper.value > lower.value);
}

export default can_i_beat