import { GameBoardContext, GamePlayersContext } from "contexts/game"
import { getCardImage } from "features/GameFeatures";
import { CSSProperties, useContext, useEffect } from "react"
import { CardType } from "types/GameTypes";
import RefreshIcon from '@mui/icons-material/Refresh';

type Props = {
    is_transfering: boolean
}

export default function GameBoard({is_transfering}: Props) {

    const board = useContext(GameBoardContext);

    const game_players = useContext(GamePlayersContext);

    const _users_id = parseInt(localStorage.getItem('user_id') || '-1');

    const {cards, setCards} = board;
    
    const show_transfer = is_transfering &&
        game_players.victim === _users_id &&
        cards.length > 1 && cards.length < 6 &&
        cards.find((c) => c.upper !== undefined) === undefined;

    function focusCard(card: CardType, index: number) {
        localStorage.setItem('card', JSON.stringify(card));
        const container = document.querySelectorAll('.game-desk-card')[index];

        if(!container) return;

        const rect = container.getBoundingClientRect();

        localStorage.setItem('card-rect-x', `${rect.left}`);
        localStorage.setItem('card-rect-y', `${rect.top}`);

        // console.log(rect.left, rect.top)
    }

    function blurCard(){
        localStorage.removeItem('card');
    }

    useEffect(() => {
        function handleTouchMove(e: TouchEvent) {
            const touch = e.touches[0];
            
            if(!touch) return;

            const element = document.elementFromPoint(touch.clientX, touch.clientY);

            if(!element) return;

            const cardIndex = element.getAttribute('data-index');

            // console.log(cardIndex)

            if(cardIndex === null) return

            if(cardIndex === 'undefined') return;

            if(cardIndex === 'player-cards') {
                blurCard();
                return
            }

            if(cardIndex === 'null'){
                const rect = document.querySelector('.game-desk-card-transfering')!.getBoundingClientRect();
                localStorage.setItem('card-rect-x', `${rect.left}`);
                localStorage.setItem('card-rect-y', `${rect.top}`);
                localStorage.setItem('card', 'null');
            }
            else{
                const index = Number(cardIndex);
                const card = cards[index];
                focusCard(card.lower, index);
            }
        }   

        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
        }
    },
    [cards]
    )

    return (
        <div id="game-desk-container">
            <section id="game-desk">
                {
                    cards.map((card, index) => (
                        <div className="game-desk-card" key={index}>
                            <img 
                            src={getCardImage(card.lower)}
                            alt={`${card.lower.value}-${card.lower.suit}`}
                            onDragStart={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            className={
                                `game-desk-card-lower 
                                ${!card.upper ? 'aviable-to-drop' : ''}
                                ${card.lower.new ? 'dropped-now' : ''}
                                `}
                            onMouseEnter={() => {
                                if(card.upper) return;
                                focusCard(card.lower, index)
                            }}
                            onMouseLeave={() => blurCard()}

                            data-index={`${card.upper ? 'undefined' : index}`}
                            />
                            {
                                card.upper &&
                                <img 
                                src={getCardImage(card.upper)}
                                alt={`${card.upper.value}-${card.upper.suit}`}
                                onDragStart={(e) => e.preventDefault()}
                                onContextMenu={(e) => e.preventDefault()}
                                className={`
                                game-desk-card-upper
                                ${card.upper.new ? 'dropped-now' : ''}
                                `}
                                />
                            }
                        </div>
                    ))
                }
                {
                    show_transfer && 
                    <div className="game-desk-card game-desk-card-transfering"
                    style={
                        {
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            border: '3px dashed white',
                            borderRadius: '10px',
                            boxSizing: 'border-box',
                        }
                    }
                    onMouseEnter={() => {
                        const rect = document.querySelector('.game-desk-card-transfering')!.getBoundingClientRect();
                        localStorage.setItem('card-rect-x', `${rect.left}`);
                        localStorage.setItem('card-rect-y', `${rect.top}`);
                        localStorage.setItem('card', 'null');
                    }}
                    onMouseLeave={blurCard}
                    data-index={'null'}
                    >
                        <RefreshIcon 
                        className="game-desk-card-transfering-icon"
                        style={{
                            fontSize: 60,
                            color: 'white',
                            opacity: 0.5
                        }}
                        />
                    </div>
                }
            </section>
        </div>
    )
}