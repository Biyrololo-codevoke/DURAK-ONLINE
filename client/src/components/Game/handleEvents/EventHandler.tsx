import React from "react";
import { GameCard, GameEvent, PlaceCard } from "types/GameTypes";
type UserIdType = number | 'me'

type Props = {
    data: GameEvent;
    setUsersIds: React.Dispatch<React.SetStateAction<UserIdType[]>>;
    make_start: () => void;
    on_player_accept: (player_id: number) => void;
    on_start_game: () => void;
    init_trump_card: (card: GameCard) => void;
    init_deck: (cards: GameCard[]) => void;
    on_next_move: (victim: number, walking: number) => void;
    on_place_card: (event: {slot: number; card: GameCard}, player_id: number) => void;
    on_game_message: (data: {user_id: number; type: 'take' | 'bito' | 'pass'}) => void
}

export default function handle_event(props: Props){
    
    const {data, setUsersIds} = props;

    console.log(`recieved message`)
    console.log(data);
    if('event' in data){
        if(data.event === 
            'player_connected'
        ) {
            console.log('new player')
            let new_id : number = data.player_id;

            if(String(new_id) === localStorage.getItem('user_id')) return

            setUsersIds(prev=>{
                console.log('updating ids')
                const n_ids = [...prev];
                for(let i = 0; i < prev.length; ++i){
                    if(typeof(n_ids[i]) === 'number' && n_ids[i] < 0){
                        n_ids[i] = new_id;
                        break;
                    }
                }

                localStorage.setItem('_users_ids', JSON.stringify(n_ids));

                return n_ids
            })
        }

        else if(
            data.event === 'make_start'
        ) {
            props.make_start()
        }

        else if(
            data.event === 'accept'
        ) {
            props.on_player_accept(data.player_id)
        } 

        else if(
            data.event === 'start_game'
        ) {
            props.on_start_game();
        }

        else if(
            data.event === 'game_init'
        ) {
            props.init_trump_card(data.last_card);
        }

        else if(
            data.event === 'init_deck'
        ) {
            props.init_deck(data.deck.cards);
        }

        else if(
            data.event === 'next'
        ) {
            props.on_next_move(data.victim_player, data.walking_player);
        }

        else if(
            data.event === 'place_card' || data.event === 'card_beat' || data.event === 'throw_card'
        ) {
            props.on_place_card(data, data.player_id);
        }

        else if(
            data.event === 'bito' || data.event === 'pass' || data.event === 'take'
        ) {
            props.on_game_message({
                user_id: data.player_id,
                type: data.event
            })
        }
    }
}