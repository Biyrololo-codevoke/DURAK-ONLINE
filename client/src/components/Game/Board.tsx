import { GameBoardContext, GamePlayersContext } from "contexts/game"
import { getCardImage } from "features/GameFeatures";
import { CSSProperties, useContext, useEffect, useMemo, useState } from "react"
import { CardType, UserCards } from "types/GameTypes";
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

    const _users_cards : UserCards = JSON.parse(localStorage.getItem('_users_cards') || '{}');

    const {cards, setCards} = board;

    const show_transfer = useMemo(()=>{

        const transfer_target = localStorage.getItem('transfer_target');

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

        let victim_cards_count = _users_cards[parseInt(transfer_target || '-1')];

        if(victim_cards_count === undefined){
            victim_cards_count = 90;
        }

        return is_transfering && transfer_flag &&
        game_players.victim === _users_id &&
        cards.length > 0 && cards.length < 4 &&
        cards.find((c) => c.upper !== undefined) === undefined &&
        victim_cards_count > cards.length;
    }, [cards, game_players, is_transfering, _users_id, board, _users_cards])

    const [visual_show_transfer, set_visual_show_transfer] = useState(false);

    useEffect(()=>{

        if(!show_transfer) {
            set_visual_show_transfer(false);
            return;
        }

        const ts = setTimeout(
            ()=>{
                set_visual_show_transfer(show_transfer)
            },
            300
        )

        return ()=>{
            clearTimeout(ts);
        }
    }, [show_transfer])

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

            if(transfer_card && drag_card.value === cards[0].lower.value){
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
        document.addEventListener('touchmove', handleTouchMove);

        return ()=> {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
        }
    }, [cards, game_players, board])

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
                    visual_show_transfer && 
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