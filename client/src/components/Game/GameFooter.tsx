import { useContext } from "react";
import ActionButton from "./ActionButton/ActionButton";
import UserAvatar from "./UserAvatar";
import { GameStateContext, TimerContext } from "contexts/game";

type Props = {
    handle_start_game: () => void
}

export default function GameFooter({handle_start_game}: Props) {

    const user_id = localStorage.getItem('user_id')

    const gameState = useContext(GameStateContext);

    const timers = useContext(TimerContext);

    const show_action = timers.timers.find((e) => String(e.id) === localStorage.getItem('user_id'));

    return (
        <div id="game-footer">
            {
                gameState !== 0 && show_action &&
                <ActionButton onClick={handle_start_game} label="Старт"/>
            }
            <UserAvatar user_id={user_id ? parseInt(user_id) : undefined}/>
        </div>
    )
}