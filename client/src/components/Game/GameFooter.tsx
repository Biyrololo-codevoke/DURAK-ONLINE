import { useContext } from "react";
import ActionButton from "./ActionButton/ActionButton";
import UserAvatar from "./UserAvatar";
import { GameMessagesContext, GameStateContext, TimerContext } from "contexts/game";
import { GameBoardCard } from "types/GameTypes";
import { MESSAGES_CONFIGS } from "constants/GameParams";

type Props = {
    handle_start_game: () => void;
    handle_action_button: (text: 'take' | 'bito' | 'pass') => void;
}

export default function GameFooter({handle_start_game, handle_action_button}: Props) {

    const user_id = localStorage.getItem('user_id')

    const gameState = useContext(GameStateContext);

    const timers = useContext(TimerContext);

    const messages = useContext(GameMessagesContext);

    const show_action = timers.timers.find((e) => String(e.id) === localStorage.getItem('user_id'));

    const _role = localStorage.getItem('_role');

    const is_victim = _role === 'victim'
    
    const is_walking = _role === 'walking'

    const _game_board : GameBoardCard[] | null = JSON.parse(localStorage.getItem('_game_board') || 'null');

    const _has_message = messages.find(m => String(m.user_id) === user_id) !== undefined;

    const is_taking = gameState === 2 && is_victim && !_has_message && _game_board !== null &&
    !_game_board.some(c => !c.upper) && _game_board.length > 0;

    const is_bito = gameState === 2 && is_walking && _game_board !== null && !_has_message &&
    _game_board.some(c => !c.upper) && _game_board.length > 0;

    const is_pass = gameState === 2 && !_has_message && 
    (
        (is_walking && messages.find(m=>m.text === MESSAGES_CONFIGS.take.text) !== undefined) ||
        (!is_walking && !is_victim && (
            messages.find(m=>m.text === MESSAGES_CONFIGS.take.text) !== undefined ||
            messages.find(m=>m.text === MESSAGES_CONFIGS.bito.text) !== undefined
            )
        )
    )

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
            {
                is_pass &&
                <ActionButton onClick={()=>{handle_action_button('pass')}} label="Пас"/>
            }
            <UserAvatar user_id={user_id ? parseInt(user_id) : undefined}/>
        </div>
    )
}