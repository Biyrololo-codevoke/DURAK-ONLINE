import { Typography } from "@mui/material"
import { CARD_COVER } from "constants/GameImages"
import { GameStateContext } from "contexts/game"
import RoomContext from "contexts/game/RoomContext"
import { getCardImage } from "features/GameFeatures"
import { useContext, useEffect, useState } from "react"
import { CardType } from "types/GameTypes"

type Props = {
    trump_card: CardType
}

export default function CardDeck(props: Props){

    const {trump_card} = props;

    const {cards_count} = useContext(RoomContext);

    const game_state = useContext(GameStateContext);

    /* [cover, lower] */
    const [params, set_params] = useState<[boolean, boolean, CardType]>([false, false, trump_card]);

    useEffect(
        ()=>{
            set_params(prev => {
                const new_params : [boolean, boolean, CardType] = [false, false, trump_card];
                
                if(cards_count > 1 && game_state !== 0){
                    new_params[0] = true;
                }

                if(cards_count > 0 && game_state === 2){
                    new_params[1] = true;
                }

                console.table(new_params)

                return new_params
            });
        },
        [cards_count, trump_card, game_state]
    )

    useEffect(
        ()=>{
            const deck_rect = document.querySelector('#card-deck-back')?.getBoundingClientRect();

            if(!deck_rect) return;

            const screen_rect = document.getElementById('game-screen')?.getBoundingClientRect();

            if(!screen_rect) return

            document.body.style.setProperty('--deck-x', `${deck_rect.x}px`);
            document.body.style.setProperty('--deck-y', `${deck_rect.y}px`);


            document.body.style.setProperty('--deck-screen-x', `${deck_rect.x - screen_rect.x}px`);
            document.body.style.setProperty('--deck-screen-y', `${deck_rect.y - screen_rect.y}px`);

        }
    )

    return (
        <section id="card-deck">
            <Typography variant="h5" component="span" id="card-deck-rest">{cards_count}</Typography>
            <div id="card-deck-container">
                {
                    params[0] &&
                    <img
                    src={CARD_COVER} 
                    alt="card back" 
                    id="card-deck-back"
                    onDragStart={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    />
                }
                {
                    params[1] &&
                    <img
                    src={getCardImage(params[2])}
                    alt="trump back" 
                    id="card-deck-trump"
                    onDragStart={(e) => e.preventDefault()}
                    onContextMenu={(e) => e.preventDefault()}
                    />
                }
            </div>
        </section>
    )
}