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

export {loginUser, registerUser, getUser, createRoom, confirmEmail, uploadPhoto}