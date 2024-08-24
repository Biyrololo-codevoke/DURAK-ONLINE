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

    console.log(`recieved message`)
    console.table(data);
    if('event' in data){
        if(data.event === 
            'player_connected'
        ) {
            console.log('new player')
            let new_id : number = data.player_id;

            if(String(new_id) === localStorage.getItem('user_id')) return

            let is_reconnect = false;

            setUsersIds(prev=>{

                if(prev.includes(new_id)){
                    is_reconnect = true;
                    return prev
                }

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

            if(is_reconnect){
                props.on_player_reconnect(new_id);
            }
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
            props.on_next_move(data.victim_player, data.walking_player, data.throwing_players, data.type, data.decKeck, data.target);
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
        else if(
            data.event === 'surprise'
        ) {
            const converted_cards : CardType[] = data.cards.map(c => convert_card(c));

            props.on_give_player_cards(converted_cards);
        }
        else if(
            data.event === 'give_cards'
        ) {
            props.on_give_enemies_cards(data.player_id, data.cards_count);
        }
        else if(
            data.event === 'get_cards'
        ) {
            const converted_cards : CardType[] = data.cards.map(c => convert_card(c));
            props.on_get_cards(converted_cards);
        }
        else if(
            data.event === 'player_taked'
        ) {
            props.on_player_took(data.cards_count, data.player_id);
        }
        else if(
            data.event === 'player_win'
        ) {
            props.on_player_win(data.player_id, data.money);
        }
        else if(
            data.event === 'game_over'
        ) {
            props.on_game_over(data.looser_id);
        }
        else if(
            data.event === 'transfer_card'
        ) {
            const c_card = convert_card(data.card)
            props.on_transfer(c_card, data.player_id)
        }
        else if(
            data.event === 'room_redirect'
        ) {
            setTimeout(()=>{
                props.on_room_redirect(data.new_room_id, data.key)
            }, 5000)
        } else if(
            data.event === 'leave'
        ) {
            props.on_player_leave(data.player_id)
        }
    }
}