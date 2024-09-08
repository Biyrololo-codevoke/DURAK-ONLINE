type UserType = {
    id: number;
    username: string;
    verified: boolean;
    image_id: string;
    money: number;
}

export type {UserType};

// Login user

type LoginRequestType = {
    email: string;
    password: string;
}

type LoginResponseType = {
    user: UserType;
    access_token: string;
}

export type {LoginRequestType, LoginResponseType};

// Register User

type RegisterRequestType = {
    username: string;
    password: string;
    email: string;
}

type RegisterResponseType = {
    user: UserType;
    access_token: string;
}

export type {RegisterRequestType, RegisterResponseType};

// Confirm email

type ConfirmEmailRequestType = {
    code: string
}

type ConfirmEmailResponseType = UserType

export type {ConfirmEmailRequestType, ConfirmEmailResponseType};

// Get User

type GetUserResponseType = {
    user: UserType
}

export type {GetUserResponseType};

// Get user Photo

type GetUserPhotoResponseType = {
    message: string;
    path: string;
}

export type {GetUserPhotoResponseType};


// Upload user Photo

type UploadUserPhotoRequestType = {
    image: string
}

export type {UploadUserPhotoRequestType};

// Get Room Info

type RoomResponseType = {
    reward: number,
    players_count: number,
    cards_count: number,
    speed: 1 | 2,
    name: string;
    game_type: 'throw' | 'translate',
    throw_type: 'all' | 'neighborhood',
    win_type: 'classic' | 'draw',
    private: boolean,
    user_ids: number[]
}

export type {RoomResponseType}

// Create Room

type CreateRoomRequestType = {
  reward: number,
  players_count: number,
  cards_count: number,
  speed: 1 | 2,
  game_type: 'throw' | 'translate',
  throw_type: 'all' | 'neighborhood',
  win_type: 'classic' | 'draw',
  private: boolean,
  password: string | null
}

type RoomType = {
    id: number,
    name: string,
    reward: number,
    cards_count: number,
    speed: 1 | 2,
    game_type: string,
    throw_type: string,
    win_type: string,
    private: boolean
}

export type {RoomType}

type CreateRoomResponseType = {
    key: string;
    room: RoomType
}

export type {CreateRoomRequestType, CreateRoomResponseType};

// RoomList wss

type RoomListResponseType = {
    [key: number]: number
}

type RoomListEvent = {
    type: 'create_room' | 'update_room' | 'delete_room',
    [key: number]: number
}

type RoomListStatusType = {
    status: 'success'
} | {
    status: 'error',
    message: string
}

type RoomListJoinEventType = {
    status: string;
    key: string | number;
}

export type {RoomListResponseType, RoomListStatusType, RoomListEvent, RoomListJoinEventType};