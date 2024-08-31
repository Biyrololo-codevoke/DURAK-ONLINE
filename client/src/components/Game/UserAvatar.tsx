import { Typography } from "@mui/material";
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { CSSProperties, useContext, useEffect, useState } from "react";
import { EMPTY_USER_PHOTO_URL } from "constants/StatisPhoto";
import axios from "axios";
import { getUser } from "constants/ApiUrls";
import { GetUserResponseType } from "types/ApiTypes";
import { AcceptedContext, GameMessagesContext, GameStateContext, TimerContext } from "contexts/game";
import { Message } from "./Message";

type Props = {
    user_id: string | number | undefined;
    update_progress?: number;
    progress_color?: 'red' | 'green';
    on_time_out?: () => void;
}

const PROGRESS_COLOR_CLASS = {
    'red': 'red-progress',
    'green': 'green-progress'
}

export default function UserAvatar(props: Props) {

    const {user_id} = props

    const accepted = useContext(AcceptedContext);

    const messages = useContext(GameMessagesContext);

    const message = messages.find(m=>m.user_id === user_id);

    const is_accepted = accepted.find(_id => _id === user_id) !== undefined;

    const [color, setColor] = useState<'red' | 'green'>('green');

    const gameState = useContext(GameStateContext);

    const timers = useContext(TimerContext);

    const is_disconnect = timers.left_players.includes(
        (
            ()=>{
                if(user_id === undefined) return -1;

                return Number(user_id);
            }
        )()
    );
    
    const show_action = timers.timers.find((e) => e.id === user_id);

    const [username, setUsername] = useState('');

    const [photo, setPhoto] = useState(EMPTY_USER_PHOTO_URL);

    const MAX_TIMER = 30;

    const [timer, setTimer] = useState(0);

    function on_time_out(){
        // TODO
        console.log(`time out for ${user_id}`)
        if(props.on_time_out && show_action && gameState === 2){
            console.log(`doing props.on_time_out`)
            props.on_time_out();
        }
    }

    useEffect(
        ()=>{

            if(gameState === 0) return

            let flag = -1;

            // console.log(timers)

            for(let i = 0; i < timers.timers.length; ++i){
                if(timers.timers[i].id === user_id){
                    flag = i;
                    break;
                }
            }

            if(flag === -1) return

            setColor(timers.timers[flag].color);
            
            if(timers.timers[flag].from_start) {
                setTimer(MAX_TIMER);
            }


            if(timers.timers[flag].is_active === false) return


            const interval = setInterval(() => {
                setTimer((prevTimer) => {
                  if (prevTimer > 0) {
                      return prevTimer - 1;
                  }
                  clearInterval(interval)
                  on_time_out();
                  return prevTimer;
                });
              }, 1000);

            return ()=>{
                clearInterval(interval);
            }
        },
        [timers.timer_update]
    )

    useEffect(
        ()=>{
            if(user_id === undefined) return
            if(String(user_id) === localStorage.getItem('user_id')){
                setUsername(prev => localStorage.getItem('username') || prev);

                setPhoto(prev => localStorage.getItem('user_photo') || prev)

                return;
            }

            axios.get(getUser(user_id))
            .then(
                res=>{
                    const data : GetUserResponseType = res.data;

                    setUsername(prev => data.user.username || prev);

                    setPhoto(prev => data.user.image_id || prev)
                }
            )
            .catch(
                err=>{
                    console.log(err)
                }
            )

        },
        [user_id]
    )

    useEffect(
        ()=>{
            const el = document.querySelector(`[data-user-id="${user_id}"]`) as HTMLDivElement;

            if(!el) return;

            const rect = el.getBoundingClientRect();

            document.body.style.setProperty(`--user-avatar-${user_id}-x`, `${rect.x}px`);
            document.body.style.setProperty(`--user-avatar-${user_id}-y`, `${rect.y}px`);
        },
        []
    )

    return (
        <div className="game-user-avatar-container" data-user-id={user_id}>
            {
                gameState !== 0 && show_action &&
                <div 
                className={`game-user-avatar__progress-bar ${PROGRESS_COLOR_CLASS[color]}`}
                style={{'--progress_val': `${100 * timer / MAX_TIMER}%`} as CSSProperties}
                ></div>
            }
            {
                gameState === 1 && is_accepted &&
                <Message 
                type="accept" 
                />
            }
            {
                message &&
                <Message
                type="text"
                color={message.color}
                message={message.text}
                />
            }
            {
                is_disconnect &&
                <Message
                type="disconnect"
                />
            }
            <img 
            src={photo} 
            alt="user avatar" 
            className="game-user-avatar"
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            />
            <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzIiXojfMxhmpHXbOsNLJ-3hAaBvjlXjezSnTcPb9cvw&s" 
            alt="achivement"
            className="game-user-achivement"
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
            />
            <Typography variant="subtitle2" component="span" style={{color: '#DDDDDD'}} className="game-user-level">11</Typography>
            <span className="game-user-level-line" style={{width: 'calc(1ch + 4px)'}}></span>
            <span className="game-user-name">{username}</span>
        </div>
    )
}

type EmptyUserAvatarProps = {
    index?: number;
    onClick?: (index: number) => void
}

function EmptyUserAvatar(props: EmptyUserAvatarProps) {

    function handleClick() {
        if(props.onClick && props.index) {
            props.onClick(props.index)
        }
    }

    return (
        <div className="game-user-avatar-container d-flex jc-center ai-center empty-avatar"
        onClick={handleClick}
        >
            <HourglassEmptyIcon sx={{color: 'white'}}/>
        </div>
    )
}

export {EmptyUserAvatar}