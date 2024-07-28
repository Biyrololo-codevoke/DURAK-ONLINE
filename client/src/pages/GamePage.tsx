import { GameFooter, GameScreen } from "components/Game"
import 'components/Game/Game.css'
import { useState, useEffect } from "react"
import { gameWS } from "constants/ApiUrls";
import Cookies from "js-cookie";
import { GameStateContext, TimerContext } from "contexts/game";
import { GameEvent, GameStateType, Timer } from "types/GameTypes";
import axios from "axios";
import { getRoomInfo } from "constants/ApiUrls";
import { RoomResponseType } from "types/ApiTypes";
import RoomContext from "contexts/game/RoomContext";
import GameInfo from "components/Game/GameInfo";
import {handle_event} from 'components/Game/handleEvents'

type UserIdType = number | 'me'

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

    const [timers, setTimers] = useState<Timer[]>([]);

    const [timers_update, set_timers_update] = useState<number>(0);

    function handle_message(data: GameEvent){
        handle_event(
            {
                data,
                setUsersIds,
                make_start
            }
        )
    }

    function make_start(){
        setTimers(
            users_ids.map((_id) => (
                {
                    id: (_id === 'me' ? parseInt(localStorage.getItem('user_id') || '-1') : _id),
                    color: 'red'
                }
            ))
        )

        set_timers_update(prev => prev + 1);

        setGameState(1);
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

        setTimers(prev => prev.filter((e) => String(e.id) !== localStorage.getItem('user_id')));

        set_timers_update(prev => prev + 1);
    }

    return (
        <main id="game-page">
            <TimerContext.Provider
            value={{timer_update: timers_update, timers}}
            >
                <GameStateContext.Provider
                value={gameState}
                >
                    <RoomContext.Provider
                    value={room}
                    >
                        <GameInfo />
                        <GameScreen 
                        players_in_room={room.players_count}
                        users_ids={users_ids}
                        setUsersIds={setUsersIds}
                        />
                        <GameFooter handle_start_game={handle_start_game} />
                    </RoomContext.Provider>
                </GameStateContext.Provider>               
            </TimerContext.Provider>
        </main>
    )
}