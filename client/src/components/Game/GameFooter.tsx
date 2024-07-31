import { useContext } from "react";
import ActionButton from "./ActionButton/ActionButton";
import UserAvatar from "./UserAvatar";
import { GameStateContext, TimerContext } from "contexts/game";
import { GameBoardCard } from "types/GameTypes";

type Props = {
    handle_start_game: () => void;
    handle_action_button: (text: 'take' | 'bito' | 'pass') => void;
}

export default function GameFooter({handle_start_game, handle_action_button}: Props) {

    const user_id = localStorage.getItem('user_id')

    const gameState = useContext(GameStateContext);

    const timers = useContext(TimerContext);

    const show_action = timers.timers.find((e) => String(e.id) === localStorage.getItem('user_id'));

    const _role = localStorage.getItem('_role');

    const is_victim = _role === 'victim'
    
    const is_walking = _role === 'walking'

    const _game_board : GameBoardCard[] | null = JSON.parse(localStorage.getItem('_game_board') || 'null');

    const is_taking = gameState === 2 && is_victim && show_action && _game_board !== null &&
    _game_board.find(c=>c.upper === undefined) !== undefined;

    const is_bito = gameState === 2 && is_walking && _game_board !== null && 
    _game_board.find(c=>c.upper === undefined) === undefined;

    return (
        <div id="game-footer">
            {
                gameState === 1 && show_action &&
                <ActionButton onClick={handle_start_game} label="Старт"/>
            }
            {
                is_taking &&
                <ActionButton onClick={()=>{handle_action_button('take')}} label="Беру"/>
            }
            {
                is_bito &&
                <ActionButton onClick={()=>{handle_action_button('bito')}} label="Бито"/>
            }
            <UserAvatar user_id={user_id ? parseInt(user_id) : undefined}/>
        </div>
    )
}