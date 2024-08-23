import { CircularProgress, IconButton, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import axios from 'axios';
import { getUser } from 'constants/ApiUrls';
import { useState, useEffect } from 'react';
import { GetUserPhotoResponseType, GetUserResponseType } from 'types/ApiTypes';
import CloseIcon from '@mui/icons-material/Close';
import {EMPTY_USER_PHOTO_URL} from 'constants/StatisPhoto';
import AddIcon from '@mui/icons-material/Add';

type Props = {
    user_id: number;
    icon_type: 'add' | 'remove';
    onClick?: (user_id: number) => void;
}

type User = {
    username: string;
    image: string;
}

export default function Friends({
    user_id, icon_type, onClick} : Props) {

    const [is_loading, setIsLoading] = useState(false);

    const [user, set_user] = useState<User | null>(null);

    useEffect(
        ()=>{
            const cancelToken = axios.CancelToken.source();

            axios.get(getUser(user_id), {
                cancelToken: cancelToken.token
            })
            .then(
                res=>{
                    const data : GetUserResponseType = res.data;

                    set_user({
                        username: data.user.username,
                        image: data.user.image_id || EMPTY_USER_PHOTO_URL
                    })
                }
            )
            .catch(console.error)

            return ()=> cancelToken.cancel();
        },
        [user_id]
    )

    function handle_click(){
        if(!onClick) return;

        onClick(user_id);
    }

    return (
        <ListItem className="friend-item">
            <ListItemAvatar>
                {user && <img src={user.image} alt={user.username} className="friend-avatar"
                />}
                {
                    is_loading && <CircularProgress />
                }
            </ListItemAvatar>
            <Typography variant="h6" className="friend-name">{user?.username}</Typography>
            <div className="friend-close-container">
                <IconButton className="friend-close-button" disabled={is_loading} onClick={handle_click}>
                    {
                        icon_type === 'add' ? <AddIcon /> : <CloseIcon />
                    }
                </IconButton>
            </div>
        </ListItem>
    )
}