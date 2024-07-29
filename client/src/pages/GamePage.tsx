import { GameFooter, GameScreen } from "components/Game"
import 'components/Game/Game.css'
import { useState, useEffect } from "react"
import { gameWS } from "constants/ApiUrls";
import Cookies from "js-cookie";
import { AcceptedContext, GameStateContext, TimerContext } from "contexts/game";
import { CardSuitType, CardType, CardValueType, GameBoardCard, GameCard, GameEvent, GameStateType, Timer } from "types/GameTypes";
import axios from "axios";
import { getRoomInfo } from "constants/ApiUrls";
import { RoomResponseType } from "types/ApiTypes";
import RoomContext from "contexts/game/RoomContext";
import GameInfo from "components/Game/GameInfo";
import {handle_event} from 'components/Game/handleEvents'
import { CARDS_SUITS_BY_SYMBOL } from "constants/GameParams";
import { convert_card } from "features/GameFeatures";

type UserIdType = number | 'me'

type UserCards = {
    'me' : CardType[],
    [key : number]: number
}

type EnemyCardDelta = {
    [key : number]: number
}


export default function GamePage(){

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

    const [users_ids, setUsersIds] = useState<UserIdType[]>(
        //[3, 5, 'me', 4, 6]
        // [-1, -2, 'me', -4, -5]
        ['me']
    );

    // users cards

    const [users_cards, setUsersCards] = useState<UserCards>({
        // 3 : 4,
        // 5 : 7,
        // 'me' : [
        //     {suit: 3, value: 10},
        //     {suit: 3, value: 9},
        //     {suit: 3, value: 8},
        //     {suit: 2, value: 7},
        //     {suit: 2, value: 14},
        //     {suit: 1, value: 14},
        //     {suit: 4, value: 13},
        // ],
        // 4 : 4,
        // 6 : 8
        'me': []
    })

    // enemis cards delta for anim

    const [enemy_cards_delta, set_enemy_cards_delta] = useState<EnemyCardDelta>(
        {
            3 : 10,
            5 : 20,
            4 : 40,
            6 : 60,
        }
    )

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

    const [game_board, setGameBoard] = useState<GameBoardCard[]>([
            // {
            //     lower: {
            //         suit: 4,
            //         value: 1
            //     },
            //     upper: {
            //         suit: 3,
            //         value: 13
            //     }
            // },
            // {
            //     lower: {
            //         suit: 2,
            //         value: 5
            //     },
            // },
            // {
            //     lower: {
            //         suit: 1,
            //         value: 2
            //     },
            // },
            // {
            //     lower: {
            //         suit: 4,
            //         value: 5
            //     },
            //     upper: {
            //         suit: 3,
            //         value: 7
            //     }
            // },
        ],
    )

    const _room_id = parseInt(localStorage.getItem('_room_id') || '-1');

    useEffect(()=>{
        axios.get(getRoomInfo(_room_id))
        .then(
            res=>{
                setRoom(res.data.room);

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
                init_deck
            }
        )
    }

    // on player accept start

    function on_player_accept(player_id: number){
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
                    from_start: true
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
    }

    // init player deck

    function init_deck(cards: GameCard[]){
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

        console.log('сюда')
    }

    useEffect(
        ()=>{
            const key = localStorage.getItem('_game_key');
            const room_id = localStorage.getItem('_room_id');

            const new_socket = new WebSocket(gameWS(key, room_id));

            new_socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                handle_message(data);
            }

            new_socket.onerror = () => {
                setSocket(null)
            }
    
            setSocket(new_socket);
    
            return () => {
                if(new_socket.readyState === 1){
                    new_socket.close();
                }
            }
        }, []
    )

    function handle_start_game(){
        if(!socket) return

        const data = {event: 'accept'}

        socket.send(
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

    return (
        <main id="game-page">
            <TimerContext.Provider
            value={{timer_update: timers_update, timers}}
            >
                <AcceptedContext.Provider
                value={accepted_start}
                >
                    <GameStateContext.Provider
                    value={gameState}
                    >
                        <RoomContext.Provider
                        value={room}
                        >
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
                            />
                            <GameFooter handle_start_game={handle_start_game} />
                        </RoomContext.Provider>
                    </GameStateContext.Provider>               
                </AcceptedContext.Provider>
            </TimerContext.Provider>
        </main>
    )
}