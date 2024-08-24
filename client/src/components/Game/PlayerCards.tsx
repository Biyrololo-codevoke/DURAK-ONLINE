import { CardType, GamePlayers } from "types/GameTypes";
import { getCardImage } from "features/GameFeatures";
import { CSSProperties, useContext, useEffect, useRef } from "react";
import { useState } from "react";
import {isMobile} from "react-device-detect";
import { GamePlayersContext } from "contexts/game";

type Props = {
    cards: CardType[] | undefined;
    throwCard: (lower_card: CardType, upper_card: CardType) => void;
    transferCard: (card: CardType) => void;
    new_cards: CardType[];
    throw_new_card: (card: CardType) => void;
}

const MAX_ROTATE = 10;  

function calculateCardStyles(index: number, length: number, image?: boolean) : CSSProperties {

    const shift = index / length * MAX_ROTATE - MAX_ROTATE/2;

    if(image){
        return {
            top: `${-shift*4}px`,
        }
    }

    return {
        rotate: `${shift}deg`,
    }
}

export default function PlayerCards(props: Props) {

    useEffect(
        ()=>{
            const rect = document.getElementById('player-cards')?.getBoundingClientRect();

            if(!rect) return

            document.body.style.setProperty('--player-cards-container-x', `${rect.x + rect.width / 2}px`)
            document.body.style.setProperty('--player-cards-container-y', `${rect.y}px`)
        },
        []
    )

    const _user_id = parseInt(localStorage.getItem('user_id') || '-1');

    const {new_cards} = props;

    // -1 - not dragging card
    const [draggin_card, setDraggin_card] = useState<number>(-1);

    // ref for draggin card
    const draggin_card_ref = useRef<HTMLDivElement>(null);

    function handleMouseUp() {
        setDraggin_card(-1);

        tryThrow();

        localStorage.removeItem('drag_index');
        localStorage.removeItem('card');
    }

    function tryThrow(){

        const players_cards_ = document.querySelectorAll('.player-card');

        for(let i = 0; i < players_cards_.length; ++i){
            (players_cards_[i] as HTMLImageElement).blur();
            (players_cards_[i] as HTMLImageElement).classList.remove('hovered');
        }

        const drag_index = Number(localStorage.getItem('drag_index') === null ? undefined : localStorage.getItem('drag_index'));

        if(Number.isNaN(drag_index)) return

        if(!draggin_card_ref.current) return;

        draggin_card_ref.current.style.display = 'none';

        const board = document.getElementById('game-desk');
 
        if(!board) return

        board.className = '';

        const card : CardType | null | -1 = JSON.parse(localStorage.getItem('card') || '-1');

        let can_throw_card = localStorage.getItem('can_throw') === 'true';

        if(!can_throw_card) {
            console.log('ошибка ошбика tryThrow')
            localStorage.removeItem('drag_card');
            return
        }

        if(localStorage.getItem('back_move') === 'true') {
            localStorage.removeItem('drag_card');
            return
        }

        console.log('trying throw')

        if(!props.cards) return;

        const drag_card : CardType | null = JSON.parse(localStorage.getItem('drag_card') || 'null');

        if(drag_card === null) return;

        drag_card.new = {
            x: parseInt(localStorage.getItem('drag-x') || '0'),
            y: parseInt(localStorage.getItem('drag-y') || '0'),
        }

        const drag_x = parseInt(localStorage.getItem('drag-x')!);
        const drag_y = parseInt(localStorage.getItem('drag-y')!);
        const card_rect_x = parseInt(localStorage.getItem('card-rect-x')!);
        const card_rect_y = parseInt(localStorage.getItem('card-rect-y')!);
        const gameScreen = document.getElementById('game-screen')!;
        const {left, top} = gameScreen.getBoundingClientRect();

        // console.log(drag_x, drag_y, card_rect_x, card_rect_y)

        document.body.style.setProperty('--drag-x', `${drag_x - (card_rect_x - left)}px`)
        document.body.style.setProperty('--drag-y', `${drag_y - (card_rect_y - top)}px`)

        drag_card.new = {
            x: drag_x - (card_rect_x - left),
            y: drag_y - (card_rect_y - top)
        }

        const is_victim = localStorage.getItem('_role') === 'victim';
        
        if(card === -1) {
            if(is_victim) return
            // console.log(drag_card)
            props.throw_new_card(drag_card);
            localStorage.removeItem('card');
            localStorage.removeItem('drag_index');
            localStorage.removeItem('drag_card');
            return
        }

        if(card === null) {
            props.transferCard(drag_card);
            localStorage.removeItem('card');
            localStorage.removeItem('drag_index');
            localStorage.removeItem('drag_card');
            return;
        }

        props.throwCard(card as CardType, drag_card);

        localStorage.removeItem('card');
        localStorage.removeItem('drag_index');
        localStorage.removeItem('drag_card');

        // console.log('кинул ', props.cards[drag_index], props.cards, drag_index)
    }

    // console.log(props.cards)

    function handleMouseMove(e: {clientX: number, clientY: number, target: any}) {
        if(!draggin_card_ref.current) return;

        // хрень не работает
        const gameScreen = document.getElementById('game-screen');

        if(!gameScreen) return

        const {left, top} = gameScreen.getBoundingClientRect();
        
        const player_cards_rect = document.getElementById('player-cards')!.getBoundingClientRect();

        const x = e.clientX - left;
        const y = e.clientY - top;

        if(isMobile){
            if(y >= player_cards_rect.y + player_cards_rect.height / 10){
                localStorage.setItem('back_move', 'true');
            } else{
                localStorage.setItem('back_move', 'false');
            }
        }
        
        if(y > player_cards_rect.y + player_cards_rect.height/3 && isMobile) {
            const cards = document.querySelectorAll('.player-card') as NodeListOf<HTMLElement>;
            cards.forEach(card => {
                if (card) { // Ensuring card is not null or undefined
                    card.classList.remove('hovered');
                }
            });
            const elem = document.elementFromPoint(e.clientX, e.clientY);
            if(!elem) return

            const parent = elem.parentElement;
            parent!.classList.add('hovered');
            return
        }

        const padding_x = Number(localStorage.getItem('padding_x'));
        const padding_y = Number(localStorage.getItem('padding_y'));

        draggin_card_ref.current.style.left = `${x - padding_x}px`;
        draggin_card_ref.current.style.top = `${y - padding_y}px`;

        localStorage.setItem('drag-x', `${x - padding_x}`);
        localStorage.setItem('drag-y', `${y - padding_y}`);
    }

    function handleTouchMove(e: TouchEvent) {
        handleMouseMove(e.touches[0]);
    }

    function handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) {
    
        // хрень не работает
        
        let can_throw_card = localStorage.getItem('can_throw') === 'true';
        if(!can_throw_card) {
            return
        }
        
        setDraggin_card(index);
        localStorage.setItem('drag_index', `${index}`);
        localStorage.setItem('drag_card', JSON.stringify(props.cards![index]));
        if(!draggin_card_ref.current) return;

        const gameScreen = document.getElementById('game-screen');

        if(!gameScreen) return

        const {left, top} = gameScreen.getBoundingClientRect();

        const card = e.target as HTMLElement;

        const card_box = card.getBoundingClientRect();

        const {left: card_left, top: card_top} = card_box

        const x = e.clientX - left;
        const y = e.clientY - top;

        const padding_x = e.clientX - card_left;
        const padding_y = e.clientY - card_top;

        draggin_card_ref.current.style.left = `${x - padding_x}px`;
        draggin_card_ref.current.style.top = `${y - padding_y}px`;
        draggin_card_ref.current.style.display = 'block';
        localStorage.setItem('padding_x', `${padding_x}`);
        localStorage.setItem('padding_y', `${padding_y}`);

        const board = document.getElementById('game-desk')!;

        board.className = 'game-desk-card-dragging';
    }

    function handleTouchStart(e: React.TouchEvent<HTMLDivElement>, index: number) {

        // хрень не работает
        let can_throw_card = localStorage.getItem('can_throw') === 'true';

        if(!can_throw_card) return

        const player_cards_rect = document.getElementById('player-cards')!.getBoundingClientRect();

        if(!draggin_card_ref.current) return;

        const gameScreen = document.getElementById('game-screen');

        if(!gameScreen) return

        const {left, top} = gameScreen.getBoundingClientRect();

        const card = e.target as HTMLElement;

        const card_box = card.getBoundingClientRect();

        const {left: card_left, top: card_top, width: card_width, height: card_height} = card_box

        localStorage.setItem('__player_cards_width', `${card_width}`);
        localStorage.setItem('__player_cards_height', `${card_height}`);

        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;

        const x = clientX - left;
        const y = clientY - top;

        if(y > player_cards_rect.y + player_cards_rect.height/3) {
            const cards = document.querySelectorAll('.player-card') as NodeListOf<HTMLElement>;
            cards.forEach(card => {
                if (card) { // Ensuring card is not null or undefined
                    card.classList.remove('hovered');
                }
            });
            card.parentElement!.classList.add('hovered');
            return
        }

        const padding_x = clientX - card_left;
        const padding_y = clientY - card_top;

        draggin_card_ref.current.style.left = `${x - padding_x}px`;
        draggin_card_ref.current.style.top = `${y - padding_y}px`;
        draggin_card_ref.current.style.display = 'block';
        localStorage.setItem('padding_x', `${padding_x}`);
        localStorage.setItem('padding_y', `${padding_y}`);

        const board = document.getElementById('game-desk')!;

        board.className = 'game-desk-card-dragging';
        setDraggin_card(index);
        localStorage.setItem('drag_index', `${index}`);
        localStorage.setItem('drag_card', JSON.stringify(props.cards![index]));
    }


    const [box_size, setBox_size] = useState(600);

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);

        document.addEventListener('mousemove', handleMouseMove);

        document.addEventListener('touchmove', handleTouchMove);

        document.addEventListener('touchend', handleMouseUp);

        setBox_size(prev => document.querySelector('#player-cards')?.getBoundingClientRect().width || prev);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);

            document.removeEventListener('mousemove', handleMouseMove);

            document.removeEventListener('touchmove', handleTouchMove);

            document.removeEventListener('touchend', handleMouseUp);
        }
    }, [])

    if(!props.cards) return null

    return (
        <>
            <section id="player-cards" className={`${draggin_card !== -1 ? 'dragging' : ''}`}
            data-index={'player-cards'}
            onMouseEnter={()=>{localStorage.setItem('back_move', 'true')}}
            onMouseLeave={()=>{localStorage.setItem('back_move', 'false')}}
            >
                {
                    props.cards.map(
                        (card, index)=>{
                            let className = '';
                            let offset = '';
                            for(let i = 0; i < new_cards.length; ++i){
                                if(new_cards[i].suit === card.suit &&
                                    new_cards[i].value === card.value){
                                        className='new_card';
                                        if(index >= props.cards!.length / 2){
                                            offset = `${-(index / (props.cards!.length) - 0.5) * box_size}px`
                                        }
                                        else{
                                            offset = `${(0.5 - index / (props.cards!.length)) * box_size}px`
                                        }
                                        break
                                }
                            }

                            let _style : CSSProperties = {}

                            let offset_taken = '';

                            if(card.taken){
                                className += 'taken-player-card';

                                if(index >= props.cards!.length / 2){
                                    offset_taken = `${-(index / (props.cards!.length) - 0.5) * box_size}px`
                                }
                                else{
                                    offset_taken = `${(0.5 - index / (props.cards!.length)) * box_size}px`
                                }

                                // console.table({offset_taken, taken: card.taken})

                                // _style = {
                                //     '--taken-from-x': `${card.taken.x}px`,
                                //     '--taken-from-y': `${card.taken.y}px`,
                                // } as CSSProperties
                            }

                            return (
                                <div key={`${card.value}-${card.suit}`} className={`player-card  ${className}`}
                                style={
                                    {
                                        ...calculateCardStyles(index, props.cards!.length),
                                        opacity: draggin_card === index ? 0.3 : 1,
                                        '--offset': offset,
                                        animationDelay: `${(props.cards!.length - 1 - index)*0.1}s`,
                                        ..._style
                                    } as CSSProperties
                                }
                                onContextMenu={(e) => e.preventDefault()}
                                // pc devices
                                onMouseDown={(e) => handleMouseDown(e, index)}
                                // touch devices
                                onTouchStart={(e) => handleTouchStart(e, index)}
                                data-index={'player-cards'}
                                >
                                    <img 
                                    src={getCardImage(card)} 
                                    alt="card" 
                                    className={`player-card-image`}
                                    style={
                                        {
                                            ...calculateCardStyles(index, props.cards!.length, true),
                                            animationDelay: `${(props.cards!.length - 1 - index)*0.3}s`,
                                            opacity: `${className? '0' : '1'}`,
                                            ...(offset_taken ? {'--offset-x': offset_taken} : {})
                                        } as CSSProperties
                                    }
                                    onDragStart={(e) => e.preventDefault()}
                                    onContextMenu={(e) => e.preventDefault()}
                                    data-index={'player-cards'}
                                    />
                                </div>
                            )
                        }
                    )
                }
            </section>
            <div id="dragging-card" ref={draggin_card_ref}
            onContextMenu={(e) => e.preventDefault()}
            >
                {
                    draggin_card !== -1 && 
                    <img src={getCardImage(props.cards[draggin_card])} alt="card"
                    style={{width: '100%', height: '100%'}} 
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    />
                }
            </div>
            
        </>
    )
}