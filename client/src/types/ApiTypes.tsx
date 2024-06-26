type UserType = {
    id: number;
    username: string;
    verified: boolean;
    image_id: string;
    money: number;
}

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
  password: string
}

type CreateRoomResponseType = {
    room: {
        id: 0,
        name: string,
        reward: number,
        cards_count: number,
        speed: 1 | 2,
        game_type: string,
        throw_type: string,
        win_type: string,
        private: boolean
    } 
}

export type {CreateRoomRequestType, CreateRoomResponseType};