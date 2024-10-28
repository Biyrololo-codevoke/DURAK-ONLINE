import { GameFooter, GameScreen } from "components/Game"
import 'components/Game/Game.css'
import { useState, useEffect, useCallback, useRef } from "react"
import { gameWS } from "constants/ApiUrls";
import Cookies from "js-cookie";
import { AcceptedContext, GameMessagesContext, GamePlayersContext, GameStateContext, TimerContext } from "contexts/game";
import { CardSuitType, CardType, CardValueType, GameBoardCard, GameCard, GameEvent, GameMessage, GamePlayers, GameStateType, PlaceCard, Reward, Timer } from "types/GameTypes";
import axios from "axios";
import { getRoomInfo } from "constants/ApiUrls";
import { RoomResponseType } from "types/ApiTypes";
import RoomContext from "contexts/game/RoomContext";
import GameInfo from "components/Game/GameInfo";
import {handle_event} from 'components/Game/handleEvents'
import { CARDS_SUITS_BY_SYMBOL, CARDS_SYMBOBS_BY_SUITS, MESSAGES_CONFIGS } from "constants/GameParams";
import { convert_card } from "features/GameFeatures";
import EndGameUI from "components/Game/EndGameUI";
import {useNavigate} from 'react-router-dom'
import { IconButton } from "@mui/material";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

type UserIdType = number | 'me'

type UserCards = {
    'me' : CardType[],
    [key : number]: number
}

type EnemyCardDelta = {
    [key : number]: number
}


export default function GamePage(){

    const navigate = useNavigate();

    // set className in-game
    useEffect(()=>{
        window.scrollTo(0, 0);
        document.body.classList.add('in-game');

        return ()=>{
            document.body.classList.remove('in-game');
        }
    }, []);

    useEffect(()=>{
        function handle_quit_game(e: KeyboardEvent){
            if(e.key === 'Escape'){
                handle_leave_game();
            }
        }

        window.addEventListener('keyup', handle_quit_game);

        return ()=>{
            window.removeEventListener('keyup', handle_quit_game);
        }
    }, []);

    const [room_key, setRoomKey] = useState<string>(localStorage.getItem('_game_key') || 'no_room_key');
    const [room_id, setRoomId] = useState<string>(localStorage.getItem('_room_id') || '-1');

    const [gameState, setGameState] = useState<GameStateType>(0); 

    const [room, setRoom] = useState<RoomResponseType>(
        {
            reward: 0,
            players_count: 1,
            speed: 1,
            name: '',
            win_type: 'classic',
            throw_type: 'all',
            game_type: 'throw',
            private: false,
            user_ids: [],
            cards_count: 24
        }
    )

    const [room_count_cards, setRoomCountCards] = useState<number>(24);

    const [bito_count, set_bito_count] = useState<number>(0);

    /**
     * player - 'me'
     * enemy - {enemy_id}
     * empty - {- index - 1}
     */

    const [users_ids, setUsersIds] = useState<UserIdType[]>(
        ['me']
    );

    const [left_users_ids, setLeftUsersIds] = useState<number[]>([]);

    // REWARDS in end game

    const [rewards, set_rewards] = useState<Reward[]>([]);

    // moving/walking && defender/victim

    const [game_players, set_game_players] = useState<GamePlayers>(
        {
            walking: -1,
            victim: -1,
            throwing_players: []
        }
    )

    // users cards

    const [users_cards, setUsersCards] = useState<UserCards>({
        'me': []
    })

    useEffect(
        ()=>{
            localStorage.setItem('_users_cards', JSON.stringify(users_cards));
        }, [users_cards]
    )

    // enemis cards delta for anim

    const [enemy_cards_delta, set_enemy_cards_delta] = useState<EnemyCardDelta>({})

    // new_cards

    const [new_cards, set_new_cards] = useState<CardType[]>([
        {suit: 3, value: 10},
        {suit: 3, value: 9},
        {suit: 3, value: 8},
        {suit: 2, value: 7},
        {suit: 2, value: 14},
        {suit: 1, value: 14},
        {suit: 4, value: 13},
    ]);

    const [game_board, setGameBoard] = useState<GameBoardCard[]>([])

    const _room_id = parseInt(localStorage.getItem('_room_id') || '-1');

    useEffect(()=>{
        axios.get(getRoomInfo(_room_id))
        .then(
            res=>{
                setRoom(res.data.room);

                setRoomCountCards(res.data.room.cards_count);

                const data : RoomResponseType = res.data.room;

                const new_arr : ('me' | number)[] = new Array(data.players_count).fill(-1);

                let i;

                let flag = false;

                for(i = 0; i < data.user_ids.length; ++i){
                    new_arr[i] = data.user_ids[i];
                    if(String(data.user_ids[i]) === localStorage.getItem('user_id')){
                        new_arr[i] = 'me'
                        flag = true;
                    }
                }

                if(!flag){
                    new_arr[i] = 'me';
                    i++;
                }

                for(; i < data.players_count; ++i){
                    new_arr[i] = -i - 1;
                }
                
                localStorage.setItem('_users_ids', JSON.stringify(new_arr));

                setUsersIds(new_arr);

            }
        )
        .catch(
            err=>{
                console.log(err)
            }
        )
    }, [_room_id])


    const [socket, setSocket] = useState<WebSocket | null>(null);

    const socket_ref = useRef<WebSocket | null>(null);

    // trump game

    const [trump_card, setTrumpCard] = useState<CardType>(
        {
            suit: 2,
            value: 11
        }
    )

    // timer

    const [timers, setTimers] = useState<Timer[]>([]);

    const [timers_update, set_timers_update] = useState<number>(0);

    const [messages, set_messages] = useState<GameMessage[]>([]);

    // accept game start

    const [accepted_start, set_accepted_start] = useState<number[]>([]);

    function handle_message(data: GameEvent){
        handle_event(
            {
                data,
                setUsersIds,
                make_start,
                on_player_accept,
                on_start_game,
                init_trump_card,
                init_deck,
                on_next_move,
                on_place_card,
                on_game_message,
                on_give_enemies_cards,
                on_give_player_cards,
                on_get_cards,
                on_player_took,
                on_player_win,
                on_game_over,
                on_transfer,
                on_room_redirect,
                on_player_leave,
                on_player_reconnect
            }
        )
    }

    function on_player_reconnect(player_id: number){
        setLeftUsersIds(prev => prev.filter(id => id !== player_id));
    }

    // on player accept start

    function on_player_accept(player_id: number){
        console.log(`set accepted ${player_id}.`)  // TODO:remove
        set_accepted_start(prev => [...prev, player_id]);
        setTimers(prev => prev.filter((t) => t.id !== player_id))
    }

    // game state = 1

    function make_start(){
        console.log('Жмите асепт')
        const _users_ids : UserIdType[] = JSON.parse(localStorage.getItem('_users_ids')!)

        console.log(_users_ids, users_ids)

        setTimers(
            _users_ids.map((__id) => {
                let _id = __id;
                if(_id === 'me') _id = parseInt(localStorage.getItem('user_id') || '-1');
                
                return {
                    id: _id,
                    color: 'red',
                    from_start: true,
                    is_active: true
                }
            })
        )

        set_timers_update(prev => prev + 1);

        setGameState(1);
    }

    // START GAME !!!
    function on_start_game(){
        setGameState(2);
        setTimers([]);
        set_timers_update(prev => prev + 1);
    }

    // Init trump card

    function init_trump_card(card_: GameCard){
        const suit = CARDS_SUITS_BY_SYMBOL[card_.suit];

        setTrumpCard(
            {
                suit: suit as CardSuitType,
                value: card_.value as CardValueType
            }
        )

        localStorage.setItem('trump_suit', String(suit))
    }

    // init player deck

    function init_deck(cards: GameCard[]){
        
        localStorage.removeItem('is_first_bito_was')

        console.log(`ИНИТ ДЕКА !!!!!!!!!!!!!`, [])

        localStorage.setItem('_game_board', JSON.stringify([]));

        const conv_cards : CardType[] = [];
        for(let c of cards){
            conv_cards.push(convert_card(c))
        }

        set_new_cards(conv_cards);
        
        const __users_cards : UserCards = {
            'me': conv_cards
        };

        const _users_ids : UserIdType[] = JSON.parse(localStorage.getItem('_users_ids')!)

        const _e_delta : EnemyCardDelta = {};

        for(let _id of _users_ids){
            if(_id === 'me') continue;
            __users_cards[_id] = 6;
            _e_delta[_id] = 60;
        }

        setUsersCards(__users_cards);

        set_enemy_cards_delta(_e_delta);

        setRoom(prev => {
            return {
                ...prev,
                cards_count: prev.cards_count -= 6 * _users_ids.length
            }
        })

        console.log('сюда')
    }

    // on next move

    function on_next_move(victim: number, walking: number, throwing_players: number[], type?: 'basic' | 'transfer', decKeck?: number, target?: number){

        localStorage.setItem('transfer_target', String(target));

        if(decKeck !== undefined){
            setRoom(prev => {
                return {
                    ...prev,
                    cards_count: decKeck
                }
            })
        }

        const take_user_id = parseInt(localStorage.getItem('take_user_id') || '-1');
        let _user_id = parseInt(localStorage.getItem('user_id') || '-1');

        localStorage.removeItem('can_throw');
        localStorage.removeItem('_role');
        localStorage.removeItem('game_players');
        const game_board : GameBoardCard[] = JSON.parse(localStorage.getItem('_game_board') || '[]');
        if(type === 'basic')
            localStorage.setItem('_game_board', JSON.stringify([]));
        
        setTimeout(() => {

            if(type === 'basic' || type === undefined){
                setTimers(
                    [
                        {
                            id: walking,
                            color: 'red',
                            from_start: true,
                            is_active: true
                        },
                        {
                            id: victim,
                            color: 'green',
                            from_start: true,
                            is_active: false
                        },
                        ...throwing_players.map((id) => {
                            return {
                                id,
                                color: 'red' as 'red' | 'green',
                                from_start: true,
                                is_active: false
                            }
                        })
                    ]
                )
            } else {
                setTimers(
                    [
                        {
                            id: walking,
                            color: 'red',
                            from_start: true,
                            is_active: false
                        },
                        {
                            id: victim,
                            color: 'green',
                            from_start: true,
                            is_active: true
                        },
                        ...throwing_players.map((id) => {
                            return {
                                id,
                                color: 'red' as 'red' | 'green',
                                from_start: true,
                                is_active: false
                            }
                        })
                    ]
                )
            }

    
            set_messages([]);
    
            set_game_players(
                {
                    walking,
                    victim,
                    throwing_players
                }
            )
    
            if(walking === _user_id || victim === _user_id){
                localStorage.setItem('can_throw', 'true')
            } else {
                localStorage.setItem('can_throw', 'false')
            }
    
            if(_user_id === victim){
                localStorage.setItem('_role', 'victim');
            } else if(_user_id === walking){
                localStorage.setItem('_role', 'walking')
            }
    
            set_timers_update(prev => prev + 1);
        }, 1200)


        if(type === 'basic'){
            const _game_board = document.querySelectorAll('.game-desk-card > img');
    
            const taking_cards : CardType[] = [];
    
            for(let c of game_board){
                taking_cards.push(c.lower)
                if(c.upper) taking_cards.push(c.upper)
            }
    
            if(take_user_id !== -1){
    
                if(_user_id !== take_user_id){
                    console.log(`[data-user-id="${take_user_id}"]`, document.querySelector(`[data-user-id="${take_user_id}"]`))
                    const _player_div = document.querySelector(`[data-user-id="${take_user_id}"]`)!;
                    const _rect = _player_div.getBoundingClientRect();
    
                    for(let i = 0; i < taking_cards.length; i++){
                        _game_board[i].classList.add('taken-card');
    
                        let _card_rect = _game_board[i].getBoundingClientRect();
    
                        let _x = _rect.x - _card_rect.x;
                        let _y = _rect.y - _card_rect.y;
    
                        (_game_board[i] as HTMLImageElement).style.setProperty('--taken-x', `${_x}px`);
                        (_game_board[i] as HTMLImageElement).style.setProperty('--taken-y', `${_y}px`);
                    }
                    set_enemy_cards_delta((prev) => {
                        return {
                            ...prev,
                            [take_user_id]: 0
                        }
                    })
    
                    setTimeout(()=>{
                        setUsersCards((prev) => {
                            return {
                                ...prev,
                                [take_user_id]: prev[take_user_id] + taking_cards.length
                            }
                        })
                        set_enemy_cards_delta((prev) => {
                            return {
                                ...prev,
                                [take_user_id]: 0
                            }
                        })
                    }, 400)
                }
                else {
                    const _player_cards = document.querySelector('#player-cards')!.getBoundingClientRect();
    
                    for(let i = 0; i < taking_cards.length; i++){
                        _game_board[i].classList.add('taken-card-player');
    
                        let _card_rect = _game_board[i].getBoundingClientRect();
    
                        let _x = (_player_cards.x + _player_cards.width/2 - _card_rect.width/2) - _card_rect.x;
                        let _y = _player_cards.y - _card_rect.y;
    
                        (_game_board[i] as HTMLImageElement).style.setProperty('--taken-x', `${_x}px`);
                        (_game_board[i] as HTMLImageElement).style.setProperty('--taken-y', `${_y}px`);
                    }
    
                    set_new_cards([]);
                }
                setTimeout(()=>{
                    setGameBoard([]);
                }, 400)
    
            } else {
    
                const _width = document.documentElement.clientWidth;
                const _height = document.documentElement.clientHeight / 2;
    
                for(let i = 0; i < _game_board.length; i++){
                    if(_game_board[i]){
                        _game_board[i].classList.add('to-bito');
                        let to_bito_x = _width - _game_board[i].getBoundingClientRect().x;
                        console.table({_width, rect: _game_board[i].getBoundingClientRect(), to_bito_x, i});
                        (_game_board[i] as HTMLImageElement).style.setProperty('--to-bito-x', `${to_bito_x + 200}px`);
                        (_game_board[i] as HTMLImageElement).style.setProperty('--to-bito-y', `${_height - _game_board[i].getBoundingClientRect().y - _game_board[i].getBoundingClientRect().height / 2}px`);
                    }
                } 
    
                set_bito_count(prev => prev + taking_cards.length);
    
                if(taking_cards.length > 0){
                    localStorage.setItem('is_first_bito_was', 'true');
                }
        
                setTimeout(()=>{
                    setGameBoard([]);
                }, 500)
            }
            localStorage.setItem('_game_board', JSON.stringify([]));
        }


        console.log(`НОВЫЙ ХОД !!!!!!!!!!!!!!!!!`)

        // localStorage.setItem('_game_board', JSON.stringify([]));

        localStorage.setItem('take_user_id', '-1');
    }

    useEffect(()=>{
        console.table({bito_count});
    }, [bito_count])

    useEffect(()=>{
        localStorage.setItem('game_players', JSON.stringify(game_players))
    }, [game_players])

    // on_place_card

    function on_place_card(event: {slot: number; card: GameCard}, player_id: number){

        console.warn('CURRENT GAME BOARD ON_PLACE_CARD ', localStorage.getItem('_game_board'));

        console.log('положил карту', {event})

        const _game_players : GamePlayers | null = JSON.parse(localStorage.getItem('game_players') || 'null');

        if(!_game_players) return;

        console.log(`[data-user-id="${player_id}"]`, document.querySelector(`[data-user-id="${player_id}"]`))

        const player_box = document.querySelector(`[data-user-id="${player_id}"]`)!

        const deck_rect = document.getElementById('game-desk')!.getBoundingClientRect();

        const slot = event.slot - 1;
        
        const _card = convert_card(event.card);

        _card.from_enemy = true;

        let _rect = player_box?.getBoundingClientRect();

        if(!_rect) return
        
        const _game_board : GameBoardCard[] = JSON.parse(localStorage.getItem('_game_board') || '[]');

        set_timers_update(prev => prev + 1);

        set_enemy_cards_delta(prev => {
            const new_delta = {...prev};
            for(let i in new_delta){
                new_delta[i] = 0;
            }

            return new_delta
        })

        setUsersCards(prev => {
            const new_cards = {...prev};
            new_cards[player_id] -= 1;
            return new_cards
        })

        if(slot >= _game_board.length){
            _card.new = {
                x: _rect.x - (deck_rect.x + deck_rect.width / 2),
                y: _rect.y - deck_rect.y
            }
            setGameBoard(prev => {
                let new_board = [...prev, {
                    lower: _card,
                }];

                console.warn('NEW GAME BOARD ON_PLACE_CARD ', new_board);

                localStorage.setItem('_game_board', JSON.stringify(new_board));

                return new_board
            })

            setTimers(prev=>{
                const _ids = [..._game_players.throwing_players, _game_players.victim, _game_players.walking];
                const ts : Timer[] = [];
                for(let i = 0; i < _ids.length; ++i){
                    ts[i] = {
                        id: _ids[i],
                        color: 'red',
                        from_start: true,
                        is_active: false
                    };
                    ts[i].from_start = true;
                    if(ts[i].id === _game_players.victim){
                        ts[i].is_active = true;
                        ts[i].color = 'green';
                    }
                    else{
                        ts[i].is_active = false;
                        ts[i].color = 'red';
                    }
                }

                return ts;
            })

            return
        }

        if(_game_board[slot]){
            if(_game_board[slot].upper){
                console.log('куда ложишь?')
                return
            }

            const card_rect = document.querySelector(`[data-card-name="card-${_game_board[slot].lower.value}-${_game_board[slot].lower.suit}"]`)?.getBoundingClientRect();

            if(card_rect){
                _card.new = {
                    x: _rect.x - card_rect.x,
                    y: _rect.y - card_rect.y
                }
            }

            let beaten_all = true;

            setGameBoard(prev=>{
                const new_board = [...prev];

                new_board[slot].upper = _card;

                console.log(`ПРОТИВНИК ПОБИЛ КАРТЦ !!!!!!!!!!!`, new_board)
                localStorage.setItem('_game_board', JSON.stringify(new_board));
                console.log('НОВАЯ БОАРД (после)', new_board, localStorage.getItem('_game_board'))

                for(let i of new_board){
                    if(!i.upper){
                        beaten_all = false;
                    }
                }

                return new_board
            })

            setTimers(prev=>{
                const _ids = [..._game_players.throwing_players, _game_players.victim, _game_players.walking];
                const ts : Timer[] = [];
                for(let i = 0; i < _ids.length; ++i){
                    ts[i] = {
                        id: _ids[i],
                        color: 'red',
                        from_start: true,
                        is_active: false
                    }
                    ts[i].from_start = true;
                    if(beaten_all){
                        if(ts[i].id === _game_players.walking){
                            ts[i].is_active = true;
                            ts[i].color = 'red';
                        }
                        else if(ts[i].id === _game_players.victim){
                            ts[i].is_active = false;
                            ts[i].color = 'green';
                        }
                        else{
                            ts[i].is_active = false;
                            ts[i].color = 'red';
                        }
                    }
                    else{
                        if(ts[i].id === _game_players.victim){
                            ts[i].is_active = true;
                            ts[i].color = 'green';
                        }
                        else{
                            ts[i].is_active = false;
                            ts[i].color = 'red';
                        }
                    }
                }

                return ts;
            })
        }
    }

    function on_give_enemies_cards(player_id: number, cards_count: number){
        
        console.warn(`RECIEVED GIVE ENEMY CARDS`)
        
        if(String(player_id) === localStorage.getItem('user_id')){
            return
        }

        let delta = 0;

        setUsersCards(prev=>{
            const new_cards = {...prev};
            delta = cards_count - new_cards[player_id];
            if(String(player_id) !== localStorage.getItem('take_user_id')) 
                new_cards[player_id] = cards_count;
            return new_cards
        })

        // setRoom(
        //     prev=>{
        //         console.log(`Минус ${delta} карт. Новое количество карт: ${prev.cards_count - delta}`)
        //         return {
        //             ...prev,
        //             cards_count: prev.cards_count - delta
        //         }
        //     }
        // )

        set_enemy_cards_delta(prev=>{
            if(Math.floor(prev[player_id] / 10) === Math.floor(delta / 10)){
                if(prev[player_id] % 10 === 9){
                    return {
                        ...prev,
                        [player_id]: delta * 10
                    }
                }
                else{
                    return {
                        ...prev,
                        [player_id]: delta * 10 + 1
                    }
                }
            }
            return {
                ...prev,
                [player_id]: delta * 10
            }
        })
    }

    function on_give_player_cards(cards: CardType[]){

        // setRoom(
        //     prev=>{
        //         console.log(`Минус ${cards.length} карт. Новое количество карт: ${prev.cards_count - cards.length}`)
        //         return {
        //             ...prev,
        //             cards_count: prev.cards_count - cards.length
        //         }
        //     }
        // )

        set_new_cards(cards);
        setUsersCards(prev=>{
            return {
                ...prev,
                'me': [...prev['me'], ...cards]
            }
        })
    }

    function on_get_cards(cards: CardType[]){

        const done_cards : CardType[] = [];

        for(let i = 0; i < cards.length; ++i){
            let _c = cards[i];

            _c.taken = true;
            
            done_cards.push(_c);
        }

        setUsersCards((prev) => {
            return {
                ...prev,
                'me': [...prev['me'], ...done_cards]
            }
        })
    }

    function on_player_took(cards_count: number, player_id: number){
        setTimeout(()=>{
            setUsersCards((prev) => {
                return {
                    ...prev,
                    [player_id]: prev[player_id] + cards_count
                }
            })   
        }, 400)
    }

    function on_game_over(looser_id: number){

        console.warn('GAME OVER', looser_id)

        const _player_div = document.querySelector(`[data-user-id="${looser_id}"]`)!;

        const _rect = _player_div.getBoundingClientRect();

        set_rewards(prev => {
            return [
                ...prev,
                {
                    id: looser_id,
                    x: _rect.x + _rect.width / 2 - 25,
                    y: _rect.y - 10,
                    money: -1
                }
            ]
        })

        setGameBoard([]);

        setTimeout(end_game, 5000)
    }

    function end_game(){

        localStorage.removeItem('game_messages');
        localStorage.removeItem('can_throw');
        localStorage.removeItem('_role');
        localStorage.removeItem('game_players');
        localStorage.removeItem('_game_board');
        localStorage.removeItem('_users_cards');
        localStorage.removeItem('take_user_id');

        setGameState(0);
        setGameBoard([]);
        setTimers([]);
        set_timers_update(-1);
        setUsersCards(prev => {
            const new_cards : UserCards = {
                'me': []
            };

            for(let k in prev){
                if(k === 'me'){
                    continue
                }

                new_cards[k] = 0;
            }

            return new_cards
        })
        set_bito_count(0);
        set_new_cards([]);
        set_enemy_cards_delta({});
        set_game_players({victim: -1, walking: -1, throwing_players: []});
    }

    useEffect(()=>{
        localStorage.setItem('game_messages', JSON.stringify(messages))
    }, [messages])

    function on_transfer(card: CardType, player_id: number) {
        console.warn('CURRENT GAME BOARD ON_TRANSFER ', localStorage.getItem('_game_board'));
        console.log(`TRANSFER FROM ${player_id}`);
        const player_box = document.querySelector(`[data-user-id="${player_id}"]`)

        const deck_rect = document.getElementById('game-desk')?.getBoundingClientRect() || {x: 0, width: 0, y: 0, height: 0};

        const _card : CardType = {
            ...card,
            from_enemy: true
        }

        let _rect = player_box?.getBoundingClientRect() || {x: 0, width: 0, y: 0, height: 0};
        _card.new = {
            x: _rect.x - (deck_rect.x + deck_rect.width / 2),
            y: _rect.y - deck_rect.y
        }

        setGameBoard(prev => {
            let new_board = [...prev, {
                lower: _card,
            }]; 
            
            console.warn('NEW GAME BOARD FROM ON_TRANSFER ', new_board);

            localStorage.setItem('_game_board', JSON.stringify(new_board));

            return new_board
        })

        setUsersCards(prev => {
            const cards = {...prev};

            cards[player_id]--;

            return cards;
        })
    }

    // victim beated all cards or victim taking

    function update_timers__victim_complete(_game_players : GamePlayers, _messages : GameMessage[]){

        const is_walking_bito = _messages.some(m => m.text === MESSAGES_CONFIGS.bito.text && m.user_id === _game_players.walking);

        setTimers(prev=>{
            const _ids = [..._game_players.throwing_players, _game_players.victim, _game_players.walking];
            const ts : Timer[] = [];
            for(let i = 0; i < _ids.length; ++i){
                ts[i] = {
                    id: _ids[i],
                    color: 'red',
                    from_start: true,
                    is_active: false
                }
                if(ts[i].id === _game_players.victim){
                    ts[i].is_active = false;
                    ts[i].color = 'green';
                }
                else{
                    ts[i].color = 'red';
                    if(is_walking_bito){
                        ts[i].is_active = true;
                    }
                    else{
                        if(ts[i].id === _game_players.walking){
                            ts[i].is_active = true;
                        }
                        else{
                            ts[i].is_active = false;
                        }
                    }
                }
            }

            return ts;
        })
        set_timers_update(prev => prev + 1);
    }

    // player places new card or victim beated card

    function update_timers__victim_beated(_game_players : GamePlayers,  _messages : GameMessage[]){
        setTimers(prev=>{
            const _ids = [..._game_players.throwing_players, _game_players.victim, _game_players.walking];
            const ts : Timer[] = [];
            for(let i = 0; i < _ids.length; ++i){
                ts[i] = {
                    id: _ids[i],
                    color: 'red',
                    from_start: true,
                    is_active: false
                }
                if(ts[i].id === _game_players.victim){
                    ts[i].is_active = true;
                    ts[i].color = 'green';
                }
                else{
                    ts[i].is_active = false;
                    ts[i].color = 'red';
                }
            }

            return ts;
        })
    }

    // on player pass or bito

    function update_timers__bito_or_pass(_game_players : GamePlayers, _player_id: number){

        setTimers(prev=>{
            const _ids = [..._game_players.throwing_players, _game_players.victim, _game_players.walking];
            const ts : Timer[] = [];
            for(let i = 0; i < _ids.length; ++i){
                ts[i] = {
                    id: _ids[i],
                    color: 'red',
                    from_start: true,
                    is_active: false
                }

                if(ts[i].id === _game_players.victim){
                    ts[i].is_active = false;
                    ts[i].color = 'green';
                }
                else{
                    ts[i].color = 'red';
                    if(ts[i].id === _player_id){
                        ts[i].is_active = false;
                    }
                    else{
                        let prev_value = prev.find(t => t.id === _player_id);
                        if(prev_value){
                            ts[i].is_active = prev_value.is_active;
                        }
                        else{
                            ts[i].is_active = true;
                        }
                    }
                }
            }

            return ts;
        })

        set_timers_update(prev => prev + 1);
    }

    // Game Message enemies, game events

    function on_game_message(data: {user_id: number; type: 'take' | 'bito' | 'pass'}){

        if(String(data.user_id) === localStorage.getItem('user_id')){
            return
        }

        const cfg = MESSAGES_CONFIGS[data.type];

        if(data.type === 'take'){
            localStorage.setItem('take_user_id', String(data.user_id));
        }

        let msgs : GameMessage[] = [];

        set_messages(prev => {
            msgs = [
                ...prev,
                {
                    user_id: data.user_id,
                    color:  cfg.color as 'white' | 'yellow',
                    text: cfg.text
                }
            ]
            return [
                ...prev,
                {
                    user_id: data.user_id,
                    color:  cfg.color as 'white' | 'yellow',
                    text: cfg.text
                }
            ]
        })

        localStorage.setItem('game_messages', JSON.stringify(msgs));

        if(data.type === 'take'){
            update_timers__victim_complete(game_players, msgs);
            return
        }

        update_timers__bito_or_pass(game_players, data.user_id);
    }

    function on_player_win(player_id: number, money: number){

        const _player_div = document.querySelector(`[data-user-id="${player_id}"]`)!;

        const _rect = _player_div.getBoundingClientRect();

        set_rewards(prev => {
            return [
                ...prev,
                {
                    id: player_id,
                    x: _rect.x + _rect.width / 2 - 25,
                    y: _rect.y - 10,
                    money
                }
            ]
        })
    }

    useEffect(
        ()=>{
            console.log('компонент монтируется, подрубаю сокет')
            // const key = localStorage.getItem('_game_key');
            // const room_id = localStorage.getItem('_room_id');
            const key = room_key;

            console.warn(`WS URL: ${gameWS(key, room_id)}`)

            const new_socket = new WebSocket(gameWS(key, room_id));

            new_socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handle_message(data);
            }

            new_socket.onerror = () => {
                console.log('айайай, ошибка, ошибка')
                setSocket(null)
            }
    
            socket_ref.current = new_socket;

            setSocket(new_socket);

            return () => {
                console.log('Компонент размонтирован, вырубаю сокет')
                console.log(`Сокет реди стейт: ${new_socket.readyState}`)
                if(new_socket.readyState === 1){
                    new_socket.close();
                }
            }
        }, [room_key, room_id]
    )

    function on_room_redirect(_room_id: number, _key: string){

        set_rewards([]);
        set_messages([]);
        set_timers_update(prev => prev + 1);
        setTimers([]);
        setRoomKey(_key);
        setRoomId(String(_room_id));
        setRoom(prev => {
            return {
                ...prev,
                cards_count: room_count_cards
            }
        })
        set_accepted_start([]);
    }

    // player throw card
    function player_throw(data: PlaceCard){

        console.log(socket_ref.current)

    
        if(!socket_ref.current) return

        console.log(`player throw`)

        console.log(data)
        
        socket_ref.current.send(
            JSON.stringify(data)
        )
        
        console.warn('CURRENT GAME BOARD PLAYER_THROW ', localStorage.getItem('_game_board'));

        const _game_board : GameBoardCard[] = JSON.parse(localStorage.getItem('_game_board') || '[]');

        const _game_players : GamePlayers = JSON.parse(localStorage.getItem('game_players') || '{}');
        
        const _users_ids : number[] = [..._game_players.throwing_players, _game_players.victim, _game_players.walking];

        const _user_id = parseInt(localStorage.getItem('user_id') || '-1');

        let is_beaten_all = true;

        for(let card of _game_board){
            if(!card.upper){
                is_beaten_all = false;
                break
            }
        }

        setTimers(prev => {
            const new_timers : Timer[] = [];

            for(let id of _users_ids){

                if(is_beaten_all){

                    if(id === _game_players.victim){
                        new_timers.push({
                            id: id,
                            color: 'green',
                            from_start: true,
                            is_active: false
                        })
                    }

                    else {
                        new_timers.push({
                            id: id,
                            color: 'red',
                            from_start: true,
                            is_active: true
                        })
                    }

                } else {
                    if(id === _game_players.victim){
                        new_timers.push({
                            id: id,
                            color: 'green',
                            from_start: true,
                            is_active: true
                        })
                    }
                    else{
                        new_timers.push({
                            id: id,
                            color: 'red',
                            from_start: true,
                            is_active: false
                        })
                    }
                }

            }

            return new_timers;
        })

        set_timers_update(prev => prev + 1);
    }

    // transfer cards

    function handle_transfer(card: CardType){
        const _socket = socket || socket_ref.current;

        if(!_socket) return

        const c_card : GameCard = {
            is_trump: card.suit === trump_card.suit,
            suit: CARDS_SYMBOBS_BY_SUITS[card.suit] as keyof typeof CARDS_SUITS_BY_SYMBOL,
            value: card.value
        }

        _socket.send(
            JSON.stringify(
                {
                    event: 'transfer_card',
                    card: c_card
                }
            )
        )

        
        console.warn('CURRENT GAME BOARD HANDLE_TRANSFER ', localStorage.getItem('_game_board'));
        localStorage.removeItem('_role');
        localStorage.removeItem('can_throw');
        set_timers_update(prev => prev + 1);

        set_game_players(prev =>({...prev, victim: -1}))
    }

    function handle_start_game(){
   
        const _socket = socket || socket_ref.current;
        
        console.log(_socket)
   
        if(!_socket) return

        const data = {event: 'accept'}

        _socket.send(
            JSON.stringify(data)
        )

        console.log('начал игру')

        setTimers(prev => 
            prev.filter(
                (e) => String(e.id) !== localStorage.getItem('user_id')
            ).map((t) => (
                {
                    ...t,
                    from_start: false
                }
            ))
        );

        set_timers_update(prev => prev + 1);

        let p_id = parseInt(localStorage.getItem('user_id') || '-1');

        on_player_accept(p_id);
    }

    // apply in game events

    function handle_action_button(text: 'take' | 'bito' | 'pass'){
        const _socket = socket || socket_ref.current;

        if(!_socket) return;

        if(text === 'take'){
            localStorage.setItem('take_user_id', localStorage.getItem('user_id') || '-1');
        }

        const cfg = MESSAGES_CONFIGS[text]; 

        _socket.send(
            JSON.stringify(
                {
                    event: text
                }
            )
        )

        let msgs : GameMessage[] = [];

        set_messages(prev => {

            msgs = [...prev, 
                {
                    user_id: parseInt(localStorage.getItem('user_id') || '-1'),
                    color:  cfg.color as 'white' | 'yellow',
                    text: cfg.text 
                }]

            return [...prev, 
                {
                    user_id: parseInt(localStorage.getItem('user_id') || '-1'),
                    color:  cfg.color as 'white' | 'yellow',
                    text: cfg.text 
                }]
        }
        );

        localStorage.setItem('game_messages', JSON.stringify(msgs));

        if(text === 'take'){
            update_timers__victim_complete(game_players, msgs);
            return
        }

        update_timers__bito_or_pass(game_players, parseInt(localStorage.getItem('user_id') || '-1'));
    }

    function player_time_out_loose(){
        console.log('PLAYER LOST ON TIME')
        const _socket = socket || socket_ref.current;

        if(!_socket) return;

        _socket.send(
            JSON.stringify(
                {
                    event: 'loose_on_time'
                }
            )
        )
    }

    function handle_leave_game(){

        console.log('выхожу из игры')

        const _socket = socket || socket_ref.current;

        if(!_socket) return;

        _socket.send(
            JSON.stringify(
                {
                    event: 'leave'
                }
            )
        )

        navigate('/');
    }

    function on_player_leave(player_id: number){
        setLeftUsersIds(prev => [...prev, player_id]);
    }

    return (
        <main id="game-page">
            <EndGameUI rewards={rewards}/>
            <TimerContext.Provider
            value={{timer_update: timers_update, timers, left_players: left_users_ids}}
            >
                <GameMessagesContext.Provider value={messages}>
                    <AcceptedContext.Provider
                    value={accepted_start}
                    >
                        <GameStateContext.Provider
                        value={gameState}
                        >
                            <RoomContext.Provider
                            value={room}
                            >
                                <GamePlayersContext.Provider
                                value={game_players}
                                >
                                    <div id="leave_game_btn__container">
                                        <IconButton onClick={handle_leave_game} style={{background: 'rgba(255, 255, 255, 0.08)'}}>
                                            <ExitToAppIcon style={{color: 'white'}} fontSize="large"/>
                                        </IconButton>
                                    </div>
                                    <GameInfo />
                                    <GameScreen
                                    game_board={game_board}
                                    setGameBoard={setGameBoard}
                                    new_cards={new_cards} 
                                    players_in_room={room.players_count}
                                    users_ids={users_ids}
                                    setUsersIds={setUsersIds}
                                    trump_card={trump_card}

                                    enemy_cards_delta={enemy_cards_delta}
                                    set_enemy_cards_delta={set_enemy_cards_delta}

                                    users_cards={users_cards}
                                    setUsersCards={setUsersCards}
                                    
                                    player_throw={player_throw}
                                    handle_transfer={handle_transfer}

                                    bito_count={bito_count}
                                    />
                                    <GameFooter 
                                    handle_start_game={handle_start_game} 
                                    handle_action_button={handle_action_button}
                                    handle_time_out_loose={player_time_out_loose}
                                    />
                                </GamePlayersContext.Provider>
                            </RoomContext.Provider>
                        </GameStateContext.Provider>               
                    </AcceptedContext.Provider>
                </GameMessagesContext.Provider>
            </TimerContext.Provider>
        </main>
    )
}