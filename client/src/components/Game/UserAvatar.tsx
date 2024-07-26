import { Typography } from "@mui/material";
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useEffect, useState } from "react";
import { EMPTY_USER_PHOTO_URL } from "constants/StatisPhoto";
import axios from "axios";
import { getUser } from "constants/ApiUrls";
import { GetUserResponseType } from "types/ApiTypes";

type Props = {
    user_id: string | number | undefined
}

export default function UserAvatar(props: Props) {

    const {user_id} = props

    const [username, setUsername] = useState('');

    const [photo, setPhoto] = useState(EMPTY_USER_PHOTO_URL);
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