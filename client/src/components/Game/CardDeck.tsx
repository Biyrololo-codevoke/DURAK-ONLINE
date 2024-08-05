import { Typography } from "@mui/material"
import { CARD_COVER } from "constants/GameImages"
import { GameStateContext } from "contexts/game"
import RoomContext from "contexts/game/RoomContext"
import { getCardImage } from "features/GameFeatures"
import { useContext, useEffect } from "react"
import { CardType } from "types/GameTypes"

type Props = {
    trump_card: CardType
}

export default function CardDeck(props: Props){

    const {trump_card} = props;

    const {cards_count} = useContext(RoomContext);

    const game_state = useContext(GameStateContext);

    useEffect(
        ()=>{
            console.table({cards_count, trump_card});
        },
        [cards_count]
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
                    game_state === 2  && cards_count > 1 && (
                        <img
                        src={getCardImage(trump_card)}
                        alt="trump back" 
                        id="card-deck-trump"
                        onDragStart={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        />
                    )
                }
                <img
                src={CARD_COVER} 
                alt="card back" 
                id="card-deck-back"
                onDragStart={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                />
                {
                    game_state == 2 && cards_count > 0 &&
                    <img
                    src={getCardImage(trump_card)}
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