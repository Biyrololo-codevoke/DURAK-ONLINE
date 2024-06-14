import { Typography } from "@mui/material";
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useEffect } from "react";

type Props = {
    user_id: string | number | undefined
}

export default function UserAvatar(props: Props) {

    const {user_id} = props

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
            src="https://sun9-21.userapi.com/impg/NNnZ7AyblPR_Gr5guTUMShZQ5BFXpe1r7hGV9Q/R_YyktJNuws.jpg?size=100x100&quality=96&sign=d26729b966df36b5b0ae86617f35f52e&type=album" 
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
            <span className="game-user-name">SEGEZHA</span>
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