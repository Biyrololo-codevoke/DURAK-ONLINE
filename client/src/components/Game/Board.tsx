import { GameBoardContext, GamePlayersContext } from "contexts/game"
import { getCardImage } from "features/GameFeatures";
import { CSSProperties, useContext, useEffect, useMemo } from "react"
import { CardType } from "types/GameTypes";
import RefreshIcon from '@mui/icons-material/Refresh';
import can_i_beat from "features/GameFeatures/CardsInteraction/CanIBeat";

type Props = {
    is_transfering: boolean
}

function element_point_dist(el: Element | null, point: {clientX: number, clientY: number}){
    if(!el) return Number.MAX_SAFE_INTEGER - 1;

    const rect = el.getBoundingClientRect();

    return Math.sqrt(
        Math.pow(
            rect.x + rect.width / 2 - point.clientX,
            2
        ) +
        Math.pow(
            rect.y + rect.height / 2 - point.clientY,
            2
        )
    )
}

export default function GameBoard({is_transfering}: Props) {

    const board = useContext(GameBoardContext);

    const game_players = useContext(GamePlayersContext);

    const _users_id = parseInt(localStorage.getItem('user_id') || '-1');

    const {cards, setCards} = board;

    const show_transfer = useMemo(()=>{
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

        return is_transfering && transfer_flag &&
        game_players.victim === _users_id &&
        cards.length > 0 && cards.length < 6 &&
        cards.find((c) => c.upper !== undefined) === undefined;
    }, [cards, game_players, is_transfering, _users_id, board])

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

            const card_width = parseFloat(localStorage.getItem('__player_cards_width') || '0');
            const card_height = parseFloat(localStorage.getItem('__player_cards_height') || '0');

            const padding_x = parseFloat(localStorage.getItem('padding_x') || '0');
            const padding_y = parseFloat(localStorage.getItem('padding_y') || '0');

            const element = document.elementFromPoint(touch.clientX, touch.clientY) ||
                document.elementFromPoint(touch.clientX - padding_x, touch.clientY - padding_y) ||
                document.elementFromPoint(touch.clientX - padding_x + card_width, touch.clientY - padding_y) ||
                document.elementFromPoint(touch.clientX - padding_x + card_width, touch.clientY - padding_y + card_height) ||
                document.elementFromPoint(touch.clientX - padding_x, touch.clientY - padding_y + card_height);

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

    useEffect(()=>{
        function handleMouseMove(e: {clientX: number, clientY: number}){
            const drag_card : CardType | null = JSON.parse(localStorage.getItem('drag_card') || 'null');
            if(drag_card === null) return

            let _role = localStorage.getItem('_role');
            if(_role !== 'victim') return;

            const is_back = localStorage.getItem('back_move') === 'true';

            const aviable_cards = document.querySelectorAll('.aviable-to-drop');

            const transfer_card = document.querySelector('.game-desk-card-transfering');

            if(is_back) {
                for(let i = 0; i < aviable_cards.length; ++i){
                    (aviable_cards[i] as HTMLImageElement).classList.remove('red-border-game-card');
                }
                if(transfer_card){
                    (transfer_card as HTMLDivElement).classList.remove('red-border-game-card');
                }
                return
            }

            let close_element = -1;
            let close_dist = 0;

            if(transfer_card){
                close_dist = element_point_dist(transfer_card, e);
            } else {
                if(aviable_cards.length === 0){
                    return
                }
                close_element = 0;
                close_dist = element_point_dist(aviable_cards[0], e);
            }

            for(let i = 0; i < aviable_cards.length; ++i){
                let _d = element_point_dist(aviable_cards[i], e);

                if(_d < close_dist){
                    close_dist = _d;
                    close_element = i;
                }
            }
            for(let i = 0; i < aviable_cards.length; ++i){
                (aviable_cards[i] as HTMLImageElement).classList.remove('red-border-game-card');
            }
            if(transfer_card){
                (transfer_card as HTMLDivElement).classList.remove('red-border-game-card');
            }

            if(close_element === -1){
                (transfer_card as HTMLDivElement)!.classList.add('red-border-game-card');
                const rect = transfer_card!.getBoundingClientRect();
                localStorage.setItem('card-rect-x', `${rect.left}`);
                localStorage.setItem('card-rect-y', `${rect.top}`);
                localStorage.setItem('card', 'null');
                return
            }

            aviable_cards[close_element].classList.add('red-border-game-card');

            const index = parseInt(aviable_cards[close_element].getAttribute('data-index')!)

            const lower_card = cards[index].lower;

            console.log(cards, index, lower_card)

            if(can_i_beat(lower_card, drag_card)){
                focusCard(lower_card, index);
            }

        }

        function handleTouchMove(e: TouchEvent){
            handleMouseMove(e.touches[0]);
        }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('touchmove', handleTouchMove);

        return ()=> {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        }
    })

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