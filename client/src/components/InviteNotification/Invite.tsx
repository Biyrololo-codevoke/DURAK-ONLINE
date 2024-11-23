import {useState, useEffect} from "react";
import { Api } from "constants/";
import {Typography, IconButton} from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import './Invite.css';
import Cookies from "js-cookie";
import { getUser } from 'constants/ApiUrls';
import axios from 'axios';
import {EMPTY_USER_PHOTO_URL} from 'constants/StatisPhoto';
import simulateJoinRoom from 'features/SimulateJoinRoom';
import {useNavigate} from "react-router-dom";


type Invite = {
    room_id: number;
    username: string;
    image: string;
}

export default function Invite(){

    const navigate = useNavigate();

    const [socket, setSocket] = useState<WebSocket | null>(null);

    const [update_invites, setUpdateInvites] = useState(0);

    useEffect(() => {
        (window as any).updateInvites = () => {
            setUpdateInvites((prev) => prev + 1);
        }

        (window as any).invite_friend = (user_id: number) => {
            let room_id = parseInt(localStorage.getItem('_room_id') || '-1');
            console.log(`invite ${user_id} to ${room_id}`, socket);
            if(!socket) return;
            const data = {
                type: "invite",
                room_id,
                user_id
            }

            console.log(`sending: ${JSON.stringify(data)}`);

            socket.send(JSON.stringify(data));
        }

    }, [socket]);


    const [invites, setInvites] = useState<Invite[] | null>(null);

    const is_open = invites !== null;


    // useEffect(() => {
    //     setTimeout(()=>{
    //         setInvites((prev) => {
    //             if(!prev) return null;
    //             return [{
    //                 room_id: 1,
    //                 username: "test 2",
    //                 image: EMPTY_USER_PHOTO_URL
    //             }, ...prev];
    //         })
    //     }, 5000)
    // }, [])


    function handle_accpet(room_id: number){
        console.log(`accpet ${room_id}`);
        simulateJoinRoom(room_id, navigate);
        handle_decline(room_id);
    }
    
    function handle_decline(room_id: number){

        // if(!invites) return;
        
        // const invite : Invite = invites.find((i) => i.room_id === room_id)!;

        // document.querySelector(`[data-room="${room_id}"]`)?.classList.add("closed");

        setInvites((prev) => {
            if(!prev) return null;
            if(prev.length <= 1) return null;
            return prev.filter((i) => i.room_id !== room_id);
        })

    }

    useEffect(() => {
        console.log('open new socket');
        const newSocket = new WebSocket(Api.invitesWS());

        newSocket.onopen = () => {
            console.log("WS invites opened");
            newSocket.send(JSON.stringify({
                access_token: Cookies.get("access_token")
            }));
        }

        newSocket.onerror = (e) => {
            console.error("WS invites error: ", e);
            newSocket.close();
            setSocket(null);
        }

        newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(`received: ${event.data}`);
            if('type' in data){
                if(data["type"] === "invite"){

                    const user_id = data["inviter_id"];

                    axios.get(getUser(user_id))
                        .then(res => {
                            const user = res.data;

                            const invite : Invite = {
                                room_id: data["room_id"],
                                username: user.user.username,
                                image: user.user.image_id || EMPTY_USER_PHOTO_URL
                            }

                            setInvites((prev) => {
                                if(!prev) return [invite];
                                return [invite, ...prev];
                            })
                    })
                }
            }
        }

        setSocket(newSocket);

        return () => newSocket.close()
    }, [update_invites]);

    if(!is_open) return null;

    return (
        <section id="invites">
            {
                invites.map((invite, index) => (
                    <div key={index} className="invite" data-room={invite.room_id}>
                        <div className="info">
                            <img src={invite.image} alt={invite.username} className="avatar"/>
                            <Typography
                                variant="h5"
                                style={{fontWeight: "bold"}}
                                className="text"
                            >
                                {invite.username}
                            </Typography>
                            <Typography
                            variant="h5"
                                className="text"
                            >
                                приглашает в игру
                            </Typography>
                        </div>
                        <div className="buttons">
                            <IconButton onClick={() => handle_decline(invite.room_id)}>
                                <CloseIcon style={{color: "red", fontSize: 30}}/>
                            </IconButton>
                            <IconButton onClick={() => handle_accpet(invite.room_id)}>
                                <CheckIcon style={{color: "green", fontSize: 30}}/>
                            </IconButton>
                        </div>
                    </div>
                ))
            }
        </section>
    )
}