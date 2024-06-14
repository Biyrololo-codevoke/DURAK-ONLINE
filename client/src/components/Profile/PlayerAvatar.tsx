import { Typography } from "@mui/material";

export default function PlayerAvatar() {
    return (
        <div id="player-avatar-container">
            <img 
            src="https://sun9-21.userapi.com/impg/NNnZ7AyblPR_Gr5guTUMShZQ5BFXpe1r7hGV9Q/R_YyktJNuws.jpg?size=100x100&quality=96&sign=d26729b966df36b5b0ae86617f35f52e&type=album" 
            alt="user avatar" 
            id="profile-avatar"
            />
            <img 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzIiXojfMxhmpHXbOsNLJ-3hAaBvjlXjezSnTcPb9cvw&s" 
            alt="achivement"
            id="profile-achivement" 
            />
            <Typography variant="h6" component="span" style={{color: '#DDDDDD'}} id="profile-level">11</Typography>
            <span id="profile-level-line" style={{width: 'calc(2ch + 4px)'}}></span>
        </div>
    )
}