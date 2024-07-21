import { GameFooter, GameScreen } from "components/Game"
import 'components/Game/Game.css'
import { useState, useEffect } from "react"
import { gameWS } from "constants/ApiUrls";

export default function GamePage(){

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
                //TODO
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
            <GameScreen />
            <GameFooter />
        </main>
    )
}