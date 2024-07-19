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

function getRoomInfo(room_id: number){
    return `/room?id=${room_id}`
}

export {getRoomInfo}

export {loginUser, registerUser, getUser, createRoom, confirmEmail, uploadPhoto}