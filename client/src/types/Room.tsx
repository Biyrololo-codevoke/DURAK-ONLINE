type Room = {
    id: number,
    game_price: number,
    currcent_player_count: number,
    players_count: number,
    cards_count: number,
    game_speed: 1 | 2,
    is_transfering: boolean,
    all_tossing: boolean,
    is_classic: boolean,
    title: string,
    is_private: boolean
}

export type {
    Room
}