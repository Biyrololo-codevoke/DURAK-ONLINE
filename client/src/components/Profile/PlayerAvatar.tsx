import { Typography } from "@mui/material";
import { EMPTY_USER_PHOTO_URL } from "constants/StatisPhoto";

export default function PlayerAvatar() {

    const photo = localStorage.getItem('user_photo') || EMPTY_USER_PHOTO_URL;

    return (
        <div id="player-avatar-container">
            <img 
            src={photo} 
            alt="user avatar" 
            id="profile-avatar"
            />
            <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzIiXojfMxhmpHXbOsNLJ-3hAaBvjlXjezSnTcPb9cvw&s" 
            alt="achivement"
            id="profile-achivement" 
            />
            <Typography variant="h6" component="span" style={{color: '#DDDDDD', background: 'rgba(0, 0, 0, 0.15)'}} id="profile-level">11</Typography>
            <span id="profile-level-line" style={{width: 'calc(2ch + 4px)'}}></span>
        </div>
    )
}