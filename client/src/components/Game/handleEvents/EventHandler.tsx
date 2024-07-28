import React from "react";
import { GameEvent } from "types/GameTypes";
type UserIdType = number | 'me'

type Props = {
    data: GameEvent;
    setUsersIds: React.Dispatch<React.SetStateAction<UserIdType[]>>;
    make_start: () => void;
    on_player_accept: (player_id: number) => void;
    on_start_game: () => void;
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
    }
}