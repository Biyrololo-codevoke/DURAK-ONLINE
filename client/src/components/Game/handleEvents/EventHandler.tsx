import { convert_card } from "features/GameFeatures";
import React from "react";
import { CardType, GameCard, GameEvent, PlaceCard } from "types/GameTypes";
type UserIdType = number | 'me'

type Props = {
    data: GameEvent;
    setUsersIds: React.Dispatch<React.SetStateAction<UserIdType[]>>;
    make_start: () => void;
    on_player_accept: (player_id: number) => void;
    on_start_game: () => void;
    init_trump_card: (card: GameCard) => void;
    init_deck: (cards: GameCard[]) => void;
    on_next_move: (victim: number, walking: number, throwing_players: number[], type?: 'basic' | 'transfer', decKeck?: number, target?: number) => void;
    on_place_card: (event: {slot: number; card: GameCard}, player_id: number) => void;
    on_game_message: (data: {user_id: number; type: 'take' | 'bito' | 'pass'}) => void;
    on_give_enemies_cards: (player_id: number, cards_count: number) => void;
    on_give_player_cards: (cards: CardType[]) => void;
    on_get_cards: (cards: CardType[]) => void;
    on_player_took: (cards_count: number, player_id: number) => void;
    on_player_win: (player_id: number, money: number) => void;
    on_game_over: (looser_id: number) => void;
    on_transfer: (card: CardType, player_id: number) => void;
    on_room_redirect: (room_id: number, key: string) => void;
    on_player_leave: (player_id: number) => void;
    on_player_reconnect: (player_id: number) => void;
}

export default function handle_event(props: Props){
    
    const {data, setUsersIds} = props;

    console.log(`received message`)
    console.table(data);
    if('event' in data){
        switch(data.event) {
            case 'player_connected':
                console.log('new player')
                let new_id : number = data.player_id;

                if(String(new_id) === localStorage.getItem('user_id')) return

                let is_reconnect = false;

                setUsersIds(prev=>{
                    if(prev.includes(new_id)){
                        is_reconnect = true;
                        return prev
                    }
                    return [...prev, new_id]
                })

                if(is_reconnect){
                    props.on_player_reconnect(new_id);
                } else {
                    props.on_player_accept(new_id);
                }
                break;

            case 'player_disconnected':
                props.on_player_leave(data.player_id);
                break;

            case 'game_timeout':
                props.on_game_over(data.loser_id);
                break;

            case 'cards_taken':
                props.on_player_took(data.cards_count, data.player_id);
                props.on_next_move(data.next_defender, data.next_attacker, data.throwing_players);
                break;

            case 'start':
                props.make_start();
                break;

            case 'game_started':
                props.on_start_game();
                break;

            case 'trump_card':
                props.init_trump_card(convert_card(data.card));
                break;

            case 'init_deck':
                props.init_deck(data.cards.map(convert_card));
                break;

            case 'next_move':
                props.on_next_move(
                    data.victim,
                    data.walking,
                    data.throwing_players,
                    data.type,
                    data.deck_count,
                    data.target
                );
                break;

            case 'place_card':
                props.on_place_card({
                    slot: data.slot,
                    card: convert_card(data.card)
                }, data.player_id);
                break;

            case 'game_message':
                props.on_game_message({
                    user_id: data.user_id,
                    type: data.type
                });
                break;

            case 'give_enemies_cards':
                props.on_give_enemies_cards(data.player_id, data.cards_count);
                break;

            case 'give_player_cards':
                props.on_give_player_cards(data.cards.map(convert_card));
                break;

            case 'get_cards':
                props.on_get_cards(data.cards.map(convert_card));
                break;

            case 'player_took':
                props.on_player_took(data.cards_count, data.player_id);
                break;

            case 'player_win':
                props.on_player_win(data.player_id, data.money);
                break;

            case 'game_over':
                props.on_game_over(data.loser_id);
                break;

            case 'transfer':
                props.on_transfer(convert_card(data.card), data.player_id);
                break;

            case 'room_redirect':
                props.on_room_redirect(data.room_id, data.key);
                break;
        }
    }
}