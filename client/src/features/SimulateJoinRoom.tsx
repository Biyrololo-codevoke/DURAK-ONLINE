import joinRoom from "./RoomList/JoiningRoom";
import handle_message from "./RoomList/handleEvents";
import { roomListWS } from "constants/ApiUrls";
import Cookies from 'js-cookie';
import {Api as Types} from 'types'

export default function simulateJoinRoom(room_id: number, navigate: (path: string) => void) {

    const socket = new WebSocket(roomListWS());

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if("error" in data){
            socket.close();
            return;
        }
        _handle_message(data);
    }

    socket.onopen = () => {
        const _data = JSON.stringify({
            access_token: Cookies.get('access_token'),
        })
        socket.send(_data);
        joinRoom(socket, room_id);
    }

    socket.onerror = (event) => {
        console.error(event);
    }

    function _handle_message(data: Types.RoomListResponseType |
        Types.RoomListStatusType |
        Types.RoomListEvent |
        Types.RoomListJoinEventType
        ){
        handle_message(data, navigate, undefined, undefined);
    }

}