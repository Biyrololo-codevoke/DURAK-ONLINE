import { CircularProgress, Divider, IconButton, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import axios from 'axios';
import { getUser } from 'constants/ApiUrls';
import { useState, useEffect } from 'react';
import { GetUserPhotoResponseType, GetUserResponseType, UserType } from 'types/ApiTypes';
import CloseIcon from '@mui/icons-material/Close';
import {EMPTY_USER_PHOTO_URL} from 'constants/StatisPhoto';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';

type Props = {
    user_id: number;
    icon_type: 'add' | 'remove';
    onClick?: (user_id: number) => void;
    color?: 'black' | 'white';
    user?: UserType
}

type User = {
    username: string;
    image: string;
}

export default function Friend({
    user_id, icon_type, onClick, color, user: imp} : Props) {

    const col = color || 'white';

    const [is_loading, setIsLoading] = useState(imp ? false : true);

    const [user, set_user] = useState<User | null>(imp ? {username: imp.username, image: imp.image_id || EMPTY_USER_PHOTO_URL} : null);

    const [is_pressed, set_is_pressed] = useState(false);

    useEffect(
        ()=>{
            if(user) return;
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

                    setIsLoading(false);
                }
            )
            .catch(console.error)

            return ()=> cancelToken.cancel();
        },
        [user_id]
    )

    function handle_click(){
        if(!onClick) return;

        set_is_pressed(true);
        onClick(user_id);
    }

    return (
        <ListItem className="friend-item">
            <ListItemAvatar>
                {user && <img src={user.image} alt={user.username} className="friend-avatar"
                />}
                {
                    is_loading && 
                    <div style={{position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)'}}>
                        <CircularProgress color='error'/>
                    </div>
                }
            </ListItemAvatar>
            <Typography variant="h6" style={{color: col, flexGrow: '1'}}>{user?.username}</Typography>
            <div className="friend-close-container">
                <IconButton className="friend-close-button" disabled={is_loading || is_pressed} onClick={handle_click}
                sx={is_loading || is_pressed ? {opacity: 0.5}: {}}>
                    {
                        icon_type === 'add' ? <AddIcon style={col === 'black' ? {color: 'red'} : {}} /> : <CloseIcon style={col === 'black' ? {color: 'red'} : {}}/>
                    }
                </IconButton>
            </div>
        </ListItem>
    )
}

function FriendOfferC({
    user_id, icon_type, on_reject, on_accept, offer_id} : Props & {on_reject: (id: number) => void, on_accept: (id: number) => void, offer_id: number}) {

    const [is_loading, setIsLoading] = useState(true);

    const [user, set_user] = useState<User | null>(null);

    const [is_pressed, set_is_pressed] = useState(false);

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

                    setIsLoading(false);
                }
            )
            .catch(console.error)

            return ()=> cancelToken.cancel();
        },
        [user_id]
    )

    function handle_accept(){
        on_accept(offer_id);
        set_is_pressed(true);
    }

    function handle_reject(){
        on_reject(offer_id);
        set_is_pressed(true);
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
            <Typography
            style={
                {
                    position: 'absolute',
                    color: 'white',
                    fontSize: '13px',
                    bottom: '3px',
                    left: '80px'
                }
            }
            >
                Приглашение
            </Typography>
            <div className="friend-close-container"
            style={{display: 'flex', gap: '20px', background: 'rgba(255, 255, 255, .9)', padding: '0 10px', borderRadius: '15px'}}
            >
                <IconButton disabled={is_loading || is_pressed} onClick={handle_accept}
                style={{color: 'red'}}
                sx={is_loading || is_pressed ? {opacity: 0.5}: {}}
                >
                    <CheckIcon />
                </IconButton>
                <Divider orientation='vertical' flexItem sx={{background: 'rgba(0,0,0,.1)'}}/>
                <IconButton disabled={is_loading || is_pressed} onClick={handle_reject}
                sx={is_loading || is_pressed ? {opacity: 0.5}: {}}
                style={{color: 'red'}}
                >
                    <CloseIcon />
                </IconButton>
            </div>
        </ListItem>
    )
}

export {FriendOfferC}