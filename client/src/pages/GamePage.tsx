import { GameFooter, GameScreen } from "components/Game"
import 'components/Game/Game.css'
import { useState, useEffect } from "react"
import { gameWS } from "constants/ApiUrls";
import Cookies from "js-cookie";
import { GameStateContext } from "contexts/game";
import { GameStateType } from "types/GameTypes";
import axios from "axios";
import { getRoomInfo } from "constants/ApiUrls";
import { RoomResponseType } from "types/ApiTypes";
import RoomContext from "contexts/game/RoomContext";
import GameInfo from "components/Game/GameInfo";

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

                for(i = 0; i < data.user_ids.length; ++i){
                    new_arr[i] = data.user_ids[i];
                }

                new_arr[i] = 'me';

                i++;

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

    function handle_message(data: any){
        console.log(`recieved message`)
        console.log(data);
        if('event' in data){
            if(data.event === 
                'player_connected'
            ) {
                let new_id : number = data.player_id;

                setUsersIds(prev=>{
                    const n_ids = prev;
                    for(let i = 0; i < prev.length; ++i){
                        if(typeof(n_ids[i]) === 'number' && n_ids[i] < 0){
                            n_ids[i] = new_id;
                            break;
                        }
                    }

                    return n_ids
                })
            }
        }
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

            new_socket.onopen = () => {
                // send token 
                // const _data = JSON.stringify({
                //     access_token: Cookies.get('access_token'),
                // })
                // new_socket.send(_data)
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

    return (
        <main id="game-page">
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
                    <GameFooter />
                </RoomContext.Provider>
            </GameStateContext.Provider>
        </main>
    )
}