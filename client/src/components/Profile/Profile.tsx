import { Typography } from "@mui/material";
import PlayerAvatar from "./PlayerAvatar";
import PlayerMoney from "./PlayerMoney";
import './Profile.css';

export default function Profile() {

    const username = localStorage.getItem('username') || '!!!ОШИБКА!!!';

    return (
        <div id="profile">
            <center id="profile-title">
                <Typography variant="h4" component="span" style={{color: '#818181'}}>{username}</Typography>
            </center>
            <section id="profile-section">
                <PlayerAvatar/>
                <PlayerMoney/>
            </section>
        </div>
    )
}