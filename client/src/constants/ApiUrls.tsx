function loginUser(){
    return `/login`
}

function registerUser(){
    return `/register`
}

function getUser(user_id: number | string | undefined = undefined){
    if(user_id === undefined) return `/user`
    return `/user?id=${user_id}`
}

function createRoom(){
    return `/room`
}

function confirmEmail(){
    return `/confirm_email`
}

function uploadPhoto(){
    return `/image/upload`
}

function roomListWS(){
    return `ws://127.0.0.1:9000/ws/room-list`
    return `/ws/room-list` // wss://codevoke.ru/ws/room-list
}

export {roomListWS}

type str_num_nu = string | number | null;

function gameWS(key: str_num_nu, room_id: str_num_nu){
    if(!key || !room_id){
        return ''
    }
    return `ws://127.0.0.1:9000/ws/room?room_id=${room_id}&key=${key}`;
    return `/ws/room?room_id=${room_id}&key=${key}`;
}

export {gameWS}

function getRoomInfo(room_id: number){
    return `/room?id=${room_id}`
}

export {getRoomInfo}

export {loginUser, registerUser, getUser, createRoom, confirmEmail, uploadPhoto}