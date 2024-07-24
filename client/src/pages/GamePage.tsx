import { GameFooter, GameScreen } from "components/Game"
import 'components/Game/Game.css'
import { useState, useEffect } from "react"
import { gameWS } from "constants/ApiUrls";
import Cookies from "js-cookie";
import { GameStateContext } from "contexts/game";
import { GameStateType } from "types/GameTypes";

export default function GamePage(){

    const [gameState, setGameState] = useState<GameStateType>(0); 

    const [socket, setSocket] = useState<WebSocket | null>(null);

    function handle_message(data: any){
        console.log(data);
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
                <GameScreen />
                <GameFooter />
            </GameStateContext.Provider>
        </main>
    )
}