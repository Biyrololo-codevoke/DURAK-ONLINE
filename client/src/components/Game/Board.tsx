import { GameBoardContext, GamePlayersContext } from "contexts/game"
import { getCardImage } from "features/GameFeatures";
import { CSSProperties, useContext, useEffect } from "react"
import { CardType } from "types/GameTypes";
import RefreshIcon from '@mui/icons-material/Refresh';
import can_i_beat from "features/GameFeatures/CardsInteraction/CanIBeat";

type Props = {
    is_transfering: boolean
}

export default function GameBoard({is_transfering}: Props) {

    const board = useContext(GameBoardContext);

    const game_players = useContext(GamePlayersContext);

    const _users_id = parseInt(localStorage.getItem('user_id') || '-1');

    const {cards, setCards} = board;
    
    let transfer_flag = true;

    for(let card of cards){
        if(card.upper){
            transfer_flag = false;
            break;
        }
    }

    for(let i = 1; i < cards.length; ++i){
        if(cards[i].lower.value !== cards[i - 1].lower.value){
            transfer_flag = false;
            break
        }
    }

    const show_transfer = is_transfering && transfer_flag &&
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
                let _role = localStorage.getItem('_role');

                if(_role !== 'victim') return;
                

                const index = Number(cardIndex);
                const card = cards[index];

                if(card.upper) return

                const drag_card : CardType | null = JSON.parse(localStorage.getItem('drag_card') || 'null');

                if(drag_card === null) return

                if(can_i_beat(card.lower, drag_card)){
                    focusCard(card.lower, index);
                }
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
                                light-shadow
                                ${!card.upper ? 'aviable-to-drop' : ''}
                                ${card.lower.new ? 'dropped-now' : ''}
                                ${card.lower.from_enemy ? 'from-enemy' : ''}`}
                            style={card.lower.new ? {
                                '--new-x': `${card.lower.new.x}px`,
                                '--new-y': `${card.lower.new.y}px`,
                            } as CSSProperties : {}}
                            onMouseEnter={() => {
                                if(card.upper) return;
                                let _role = localStorage.getItem('_role');
                                if(_role !== 'victim') return;

                                const drag_card : CardType | null = JSON.parse(localStorage.getItem('drag_card') || 'null');
                                if(drag_card === null) return

                                if(can_i_beat(card.lower, drag_card)){
                                    focusCard(card.lower, index)
                                }

                            }}
                            onMouseLeave={() => blurCard()}

                            data-card-name ={`card-${card.lower.value}-${card.lower.suit}`}
                            data-index={`${card.upper ? 'undefined' : index}`}
                            />
                            {
                                card.upper &&
                                <img 
                                src={getCardImage(card.upper)}
                                alt={`${card.upper.value}-${card.upper.suit}`}
                                onDragStart={(e) => e.preventDefault()}
                                onContextMenu={(e) => e.preventDefault()}
                                style={card.upper.new ? {
                                    '--new-x': `${card.upper.new.x}px`,
                                    '--new-y': `${card.upper.new.y}px`,
                                } as CSSProperties : {}}
                                className={`
                                game-desk-card-upper
                                light-shadow
                                ${card.upper.new ? 'dropped-now' : ''}
                                ${card.upper.from_enemy ? 'from-enemy' : ''}`}

                                data-card-name ={`card-${card.upper.value}-${card.upper.suit}`}
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