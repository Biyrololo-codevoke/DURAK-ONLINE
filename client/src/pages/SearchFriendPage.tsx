import './FriendsPage.css'
import { List, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Friend from 'components/FriendsPage/Friend';
import axios from 'axios';

export default function SearchFriendPage() {

    const [users, setUsers] = useState<number[]>([]);

    const [find_value, setFindValue] = useState('');

    useEffect(() => {

        const cancelToken = axios.CancelToken.source();

        const delayRequest = setTimeout(() => {
            axios.get(
                `/users?nickname=${find_value}&offset=${0}&limit=${999}`,
                {
                    cancelToken: cancelToken.token
                }
            )
            .then(
                res => {
                    setUsers(res.data.users);
                }
            )
            .catch(
                console.error
            )
        }, 1000);

        return () => {
            clearTimeout(delayRequest);
            cancelToken.cancel();
        }

    }, [find_value]);

    function handle_add_friend(friend_id : number) {
        const url = `/api/friendship/offer`

        axios.post(url, {
            friend_id
        }, {})
        .then(
            () => {
                console.log('отправил в др')
            }
        )
        .catch(
            console.error
        )
    }

    return (
        <main>
            <section id="friends-title">
                <Typography variant="h5" style={{color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center'}}>Поиск</Typography>                
            </section>
            <div id="friends-search-container">
                <TextField 
                variant="filled" 
                fullWidth 
                autoComplete='off'
                value={find_value}
                onChange={(e) => setFindValue(e.target.value)}
                sx={
                    {
                        '& .MuiInputBase-root' : {
                            borderRadius: '0 50px 50px 0',
                        },
                        '& .MuiInputBase-root::before' : {
                            border: 'none',
                            width: '0'
                        },
                        '& input::after' : {
                            border: 'none !important'
                        }
                    }
                }
                />
            </div>
            <List id="friends-list">
                {users.map((id) => (
                    <Friend key={id} user_id={id} icon_type="add" onClick={handle_add_friend}/>
                ))}
            </List>
        </main>
    )
}