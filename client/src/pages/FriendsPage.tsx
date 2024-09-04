import { CircularProgress, Divider, IconButton, List, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import axios from 'axios'
import './FriendsPage.css'
import Friend, {FriendOfferC} from "components/FriendsPage/Friend";
import SearchIcon from '@mui/icons-material/Search';
import { Link } from "react-router-dom";
import { FriendOffer } from "types/GameTypes";

export default function FriendsPage(){

    const [friends, setFriends] = useState<number[]>([]);
    const [is_loading, setIsLoading] = useState(true);

    const [offers, set_offers] = useState<FriendOffer[]>([]);

    useEffect(()=>{
        const url = '/api/friendship/offer';

        const cancelToken = axios.CancelToken.source();

        axios
        .get(url, {cancelToken: cancelToken.token})
        .then((response) => {
            set_offers(response.data.offers);
        })
        .catch((error) => {
            if (axios.isCancel(error)) {
                return;
            }
        })

        return () => {
            cancelToken.cancel();
        }
    }, [])

    useEffect(() => {
        const cancelToken = axios.CancelToken.source();

        axios
        .get('/api/friendship/friends', {cancelToken: cancelToken.token})
        .then((response) => {
            setFriends(response.data.friends);
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

    function handle_delete_friend(friend_id : number) {

        // axios request

        setFriends(friends.filter((id) => id !== friend_id));
    }

    function reject_offer(offer_id: number){
        const url = `/api/friendship/offer`

        const data = {
            offer_id,
            status: 'rejected'
        }

        axios.patch(url, data)
        .then(
            ()=> {
                set_offers(prev => prev.filter(c => c.id !== offer_id))
            }
        )
        .catch(console.error)
    }

    function accept_offer(offer_id: number){
        const url = `/api/friendship/offer`

        const data = {
            offer_id,
            status: 'accepted'
        }

        axios.patch(url, data)
        .then(
            ()=> {
                set_offers(prev => prev.filter(c => c.id !== offer_id))
            }
        )
        .catch(console.error)
    }

    return (
        <main>
            <section id="friends-title">
                <Typography variant="h5" style={{color: 'rgba(0, 0, 0, 0.6)', textAlign: 'center'}}>Друзья</Typography>
                <IconButton className="search-friend">
                    <Link to="/search-friends" style={{color: 'inherit', height: 35}}>
                        <SearchIcon fontSize="large"/>
                    </Link>
                </IconButton>
            </section>
            {
                offers.length > 0 &&
                <List>
                    {
                        offers.map((offer) => (
                            <>
                                <FriendOfferC 
                                key={offer.id}
                                icon_type="add"
                                on_reject={reject_offer}
                                on_accept={accept_offer}
                                user_id={offer.sender_id}
                                offer_id={offer.id}
                                />
                                <Divider />
                            </>
                        ))
                    }
                </List>
            }
            {
                is_loading && <center id="friends-list-loading">
                    <CircularProgress size={50} />
                </center>
            }
            {
                !is_loading && friends.length === 0 && <Typography variant="h5" style={{color: 'white', textAlign: 'center', marginTop: 30}}>У вас нет друзей</Typography>
            }
            {
                friends.length > 0 && (
                    <List id="friends-list">
                        {
                            friends.map((friend_id, index) => (
                                <>
                                    <Friend key={friend_id} user_id={friend_id} icon_type="remove" onClick={handle_delete_friend}/>
                                    <Divider />
                                </>
                            ))
                        }
                    </List>
                )
            }
            
        </main>
    )
}