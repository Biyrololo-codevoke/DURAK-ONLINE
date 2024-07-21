function loginUser(){
    return `/login`
}

function registerUser(){
    return `/register`
}

function getUser(){
    return `/user`
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
    return `/ws/room/list` // wss://codevoke.ru/ws/room/list
}

export {roomListWS}

type str_num_nu = string | number | null;

function gameWS(key: str_num_nu, room_id: str_num_nu){
    if(!key || !room_id){
        throw new Error('Incorrect data')
    }
    return `/ws/room?room_id=${room_id}&key=${key}`;
}

export {gameWS}

function getRoomInfo(room_id: number){
    return `/room?id=${room_id}`
}

export {getRoomInfo}

export {loginUser, registerUser, getUser, createRoom, confirmEmail, uploadPhoto}