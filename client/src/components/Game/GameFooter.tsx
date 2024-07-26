import { useContext } from "react";
import StartGame from "./ActionButton/StartGame";
import UserAvatar from "./UserAvatar";
import { GameStateContext } from "contexts/game";

export default function GameFooter() {

    const user_id = localStorage.getItem('user_id')

    const gameState = useContext(GameStateContext);

    function handle_start_game(){
        // TODO
    }

    return (
        <div id="game-footer">
            {
                gameState === 1 &&
                <StartGame start={()=>{}}/>
            }
            <UserAvatar user_id={user_id ? parseInt(user_id) : undefined}/>
        </div>
    )
}