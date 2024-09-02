import { useState, useEffect } from "react";
import { IconButton, Divider, List, Typography } from "@mui/material"
import axios from 'axios'
import 'pages/FriendsPage.css'
import Friend from "components/FriendsPage/Friend";
import CloseIcon from '@mui/icons-material/Close';

type Props = {
    is_open: boolean;
    on_close: () => void;
}

export default function InviteFriends({is_open, on_close} : Props){

    const [friends, setFriends] = useState<number[]>([]);
    const [is_loading, setIsLoading] = useState(true);

    useEffect(() => {
        const cancelToken = axios.CancelToken.source();

        axios
        .get('get-user-friends', {cancelToken: cancelToken.token})
        .then((response) => {
            setFriends(response.data);
            setIsLoading(false);
        })
        .catch((error) => {
            if (axios.isCancel(error)) {
                return;
            }
        })

        return () => {
            cancelToken.cancel();
        }

    }, []);

    function handle_invite_friend(friend_id: number){
        // invite friend
        // TODO
    }

    if(!is_open) return null;

    return (
        <div
        style={
            {
                position: 'absolute',
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                padding: 14%
            }
        }
        >
            <section
            style={
                {
                    overflow: 'auto'
                }
            }
            >
                <div style={
                    {
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }
                }>
                    <IconButton style={{color: 'white'}} onClick={on_close}>
                        <CloseIcon style={{color: 'white'}}/>
                    </IconButton>
                </div>
                <List id="friends-list">
                    {
                        friends.map((friend_id, index) => (
                            <>
                                <Friend key={friend_id} user_id={friend_id} icon_type="add" onClick={handle_invite_friend}/>
                                <Divider />
                            </>
                        ))
                    }
                </List>
            </section>
        </div>
    )
}