import { useContext, useEffect, useMemo, useState } from "react";
import ActionButton from "./ActionButton/ActionButton";
import UserAvatar from "./UserAvatar";
import { GameMessagesContext, GameStateContext, TimerContext } from "contexts/game";
import { GameBoardCard, GamePlayers } from "types/GameTypes";
import { MESSAGES_CONFIGS } from "constants/GameParams";
import MoneyShortName from "features/MoneyShortName";
import Money from "components/Money/MoneyIcon";
import {Button} from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import InviteFriends from 'components/Game/InviteFriends';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

type Props = {
    handle_start_game: () => void;
    handle_action_button: (text: 'take' | 'bito' | 'pass') => void;
    handle_time_out_loose: () => void;
}

export default function GameFooter({handle_start_game, handle_action_button, handle_time_out_loose}: Props) {

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

    const [is_taking, set_is_taking] = useState(gameState === 2 && is_victim && !_has_message && _game_board !== null &&
    _game_board.some(c => !c.upper) && _game_board.length > 0)

    const [is_bito, set_is_bito] = useState(gameState === 2 && is_walking && _game_board !== null && !_has_message &&
    !_game_board.some(c => !c.upper) && _game_board.length > 0)

    const [is_pass, set_is_pass] = useState(gameState === 2 && !_has_message && 
    (
        (is_walking && messages.some(m=>m.text === MESSAGES_CONFIGS.take.text)) ||
        (!is_walking && !is_victim && (
            messages.some(m=>m.text === MESSAGES_CONFIGS.take.text) ||
            messages.some(m=>m.text === MESSAGES_CONFIGS.bito.text)
            )
        )
    ) )

    const is_my_turn : boolean = useMemo(()=> {
        if(localStorage.getItem('_role') !== 'walking') return false;
        const _has_message = messages.some(m => String(m.user_id) === user_id);
        if(_has_message) return false;
        if(gameState !== 2) return false;
        let res : boolean = false;
        for(let i = 0; i < timers.timers.length; ++i) {
            if(String(timers.timers[i].id) === user_id) {
                res = timers.timers[i].is_active && timers.timers[i].color === 'red';
                break;
            }

        }
        return res
    }, [timers.timers, timers.timer_update, gameState, messages]);

    useEffect(() => {

        const __role = localStorage.getItem('_role');

        const _is_victim = __role === 'victim'
        
        const _is_walking = __role === 'walking'

        const __game_board : GameBoardCard[] = JSON.parse(localStorage.getItem('_game_board') || '[]');

        const __has_message = messages.some(m => String(m.user_id) === user_id);

        const _game_players : GamePlayers = JSON.parse(localStorage.getItem('game_players') || '{}');

        console.table({
            __role,
            _is_victim,
            __has_message,
            __game_board,
            _is_walking
        })

        console.table(
            {
                messages,
                gameState
            }
        )

        set_is_taking(gameState === 2 && _is_victim && !__has_message && __game_board !== null &&
        __game_board.some(c => !c.upper) && __game_board.length > 0)

        set_is_bito(gameState === 2 && __game_board !== null && !__has_message &&
        !__game_board.some(c => !c.upper) && __game_board.length > 0 && (
            _is_walking || (
                !is_walking && !is_victim && (
                    messages.some(m=>m.text === MESSAGES_CONFIGS.bito.text && m.user_id === _game_players.walking)
                )
            )
        ))

        set_is_pass(gameState === 2 && !__has_message && 
            __game_board.length > 0 &&
            (
                (_is_walking && messages.some(m=>m.text === MESSAGES_CONFIGS.take.text)) ||
                (!is_walking && !_is_victim && 
                    messages.some(m=>m.text === MESSAGES_CONFIGS.take.text)
                )
            )
        )

    }, [timers.timer_update, messages])

    const handle_time_out = useMemo(() => {

        console.table(
            {
                is_bito,
                is_pass,
                is_taking
            }
        )
    
        let is_b = is_bito;
        let is_p = is_pass;
        let is_t = is_taking;

        return () => {
            console.log(`Player time out!`)
            if(is_p){
                console.log('PASS')
                handle_action_button('pass')
            }
            else if(is_b){
                console.log('BITO')
                handle_action_button('bito')
            }
            else if(is_t){
                console.log('IS TAKING')
                handle_time_out_loose();
            }
        }
    }, [is_pass, is_bito, is_taking])

    const [is_open, set_is_open] = useState(false);

    return (
        <>
            <InviteFriends is_open={is_open} on_close={()=>{set_is_open(false)}}/>
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
                {
                    is_my_turn && !is_bito &&
                    <ActionButton text={true} onClick={()=>{}} label="Ваш ход"/>
                }
                {
                    gameState === 0 && <div id="invite_player">
                        <Button style={{color: 'white', display: 'flex', 'alignItems': 'center'}} onClick={()=>{set_is_open(true)}}
                            variant="outlined"
                        >
                            Пригласить друзей &nbsp;
                            <GroupAddIcon style={{color: 'white'}}/>
                        </Button>
                    </div>
                }
                <UserAvatar user_id={user_id ? parseInt(user_id) : undefined} on_time_out={handle_time_out}/>
                <div id="game-footer-money">
                    {MoneyShortName(parseInt(localStorage.getItem('player_money') || '0'))}
                    <Money size="small"/>
                </div>
            </div>
        </>
    )
}