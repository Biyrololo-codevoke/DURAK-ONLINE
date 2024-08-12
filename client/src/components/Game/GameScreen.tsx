import React, {useCallback, useEffect, useMemo, useState} from "react";
import UserAvatar, {EmptyUserAvatar} from "./UserAvatar";
import { Typography } from "@mui/material";
import { CardType, GameBoardCard, GameBoardType, GamePlayers, PlaceCard } from "types/GameTypes";
import PlayerCards from "./PlayerCards";
import CardDeck from "./CardDeck";
import EnemyCards from "./EnemyCards";
import {GameBoardContext} from "contexts/game";
import GameBoard from "./Board";
import { GameStateContext } from "contexts/game";
import { useContext } from "react";
import axios from "axios";
import { getRoomInfo } from "constants/ApiUrls";
import { RoomResponseType } from "types/ApiTypes";
import RoomContext from "contexts/game/RoomContext";
import { CARDS_SUITS_BY_SYMBOL, CARDS_SYMBOBS_BY_SUITS } from "constants/GameParams";
import Bito from "./Bito";

type UserIdType = number | 'me'

type UserCards = {
    'me' : CardType[],
    [key : number]: number
}

type EnemyCardDelta = {
    [key : number]: number
}

type Props = {
    players_in_room: number;
    users_ids: UserIdType[];
    setUsersIds: React.Dispatch<React.SetStateAction<UserIdType[]>>;
    trump_card: CardType;
    new_cards: CardType[];
    game_board: GameBoardCard[];
    setGameBoard: React.Dispatch<React.SetStateAction<GameBoardCard[]>>;
    enemy_cards_delta: EnemyCardDelta;
    set_enemy_cards_delta: React.Dispatch<React.SetStateAction<EnemyCardDelta>>;
    users_cards: UserCards;
    setUsersCards: React.Dispatch<React.SetStateAction<UserCards>>

    player_throw: (event: PlaceCard) => void;
    handle_transfer: (card: CardType) => void;

    bito_count: number
}

export default function GameScreen(props: Props){

    const {players_in_room, users_ids, setUsersIds} = props;

    const {trump_card} = props;

    const game_state = useContext(GameStateContext);

    const room = useContext(RoomContext);

    const is_transfering = useMemo(() => {
        return room.game_type === 'translate'
    }, [room.game_type, room]);

    // const [users_ids, setUsersIds] = useState<UserIdType[]>(
    //     //[3, 5, 'me', 4, 6]
    //     // [-1, -2, 'me', -4, -5]
    //     ['me']
    // );

    const {users_cards, setUsersCards} = props;

    // const [players_in_room, set_players_in_room] = useState(0); //5

    const start_num = users_ids.indexOf('me')! % players_in_room + 1;

    const _room_id = parseInt(localStorage.getItem('_room_id') || '-1');

    function changeSeat(newSeat : number){

        // пока нельзя
        
        return


        // replace me with new seat

        console.log('change seat', newSeat, users_ids)

        setUsersIds((prev) => {
            return prev.map((user_id, index) => {
                if(user_id === 'me'){
                    if(prev[newSeat] < 0){
                        return -index - 1;
                    }
                }
                if (index === newSeat) {
                    return 'me'
                }
                return user_id
            })
        })
    }

    const next_users = users_ids.slice(users_ids.indexOf('me') + 1);

    const prev_users = users_ids.slice(0, users_ids.indexOf('me'));

    const {game_board, setGameBoard} = props;

    function handleThrowCard(lower_card: CardType, upper_card: CardType){
        
        let index = -1;

        setGameBoard((prev) => {
            let new_board = prev.map(
                (c, i) => {
                    if(c.lower.value === lower_card.value && c.lower.suit === lower_card.suit){
                        index = i;
                        return {
                            ...c,
                            upper: upper_card
                        }
                    }
                    return c
                }
            )
            
            console.log(`ПОБИЛ КАРТУ !!!!!!!!!!!!!!!!!!!!!!!!!!`, new_board)

            localStorage.setItem('_game_board', JSON.stringify(new_board))

            return new_board
        })

        setUsersCards((prev) => {
            return {
                ...prev,
                'me': [...prev['me'].filter((card, index) => !(card.suit === upper_card.suit && card.value === upper_card.value))]
            }
        })

        props.player_throw(
            {
                slot: index + 1,
                card: {
                    suit: CARDS_SYMBOBS_BY_SUITS[upper_card.suit] as keyof typeof CARDS_SUITS_BY_SYMBOL,
                    value: upper_card.value,
                    is_trump: trump_card.suit === upper_card.suit
                },
                event: 'place_card'
            }
        )
    }

    function throw_new_card(add_card: CardType){

        const _game_board : GameBoardCard[] | null = JSON.parse(localStorage.getItem('_game_board') || 'null');

        if(_game_board === null) return

        console.log(`add new card to board`)

        console.log(
            {
                add_card,
                _game_board
            }
        )

        let index = _game_board.length + 1;

        let is_first_bito_was = localStorage.getItem('is_first_bito_was') === 'true';

        if(is_first_bito_was){
            if(index === 7) {
                return
            }
        } else {
            if(index === 6) {
                console.log(`куда кидаешь, фул уже`)
                return
            }
        }

        const _users_cards : UserCards = JSON.parse(localStorage.getItem('_users_cards') || '{}');

        const _game_players : GamePlayers = JSON.parse(localStorage.getItem('game_players') || '{}');

        let victim = _game_players.victim;
        
        if(_users_cards[victim] === 0){
            return
        }

        let flag = false;

        if(_game_board.length === 0) flag = true;

        for(let c of _game_board){
            if(c.lower.value === add_card.value){
                flag = true;
                break
            }
            if(c.upper){
                if(c.upper.value === add_card.value){
                    flag = true;
                    break
                }
            }
        }

        if(!flag) return

        setGameBoard(prev=>{
            let new_board = [...prev, {
                lower: add_card
            }];

            console.log(`НОВАЯ КАРТА !!!!!!!!!!!!!!!!!`, new_board)

            localStorage.setItem('_game_board', JSON.stringify(new_board));

            return new_board
        })

        setUsersCards((prev) => {
            return {
                ...prev,
                'me': [...prev['me'].filter((card, index) => !(card.suit === add_card.suit && card.value === add_card.value))]
            }
        })

        props.player_throw(
            {
                event: 'place_card',
                slot: index,
                card: {
                    suit: CARDS_SYMBOBS_BY_SUITS[add_card.suit] as keyof typeof CARDS_SUITS_BY_SYMBOL,
                    value: add_card.value,
                    is_trump: trump_card.suit === add_card.suit
                }
            }
        )

        
    }

    function handleTransfer(card: CardType){


        // const _game_players : GamePlayers = JSON.parse(localStorage.getItem('game_players') || '{}');

        // const is_first_bito_was = localStorage.getItem('is_first_bito_was') === 'true';

        // if(is_first_bito_was){
        //     if(users_cards[_game_players.]){
        //         return
        //     }
        // } else {
        //     if(_game_players.throwing_players.length === 1){
        //         return
        //     }
        // }

        // console.log('новая карта', users_cards['me'][card_index], card_index, users_cards['me'])

        setGameBoard((prev)=>{
            let new_board = [...prev, {lower: card}];
            localStorage.setItem('_game_board', JSON.stringify(new_board));

            return new_board
        })

        console.log('game board', game_board)
        
        setUsersCards((prev) => {
            return {
                ...prev,
                'me': [...prev['me'].filter((c, index) => !(c.suit === card.suit && c.value === card.value))]
            }
        })

        props.handle_transfer(card);
        // console.log('мои новые карты', [...users_cards['me'].filter((card, index) => index !== card_index)])
    }

    const {new_cards} = props;

    const {enemy_cards_delta, set_enemy_cards_delta} = props;


    // useEffect(
    //     ()=>{
    //         document.addEventListener('keypress', (e)=>{
    //                 const new_card : CardType = 
    //                 {
    //                     suit: 2,
    //                     value: 8
    //                 };
    //                 set_new_cards([
    //                     new_card
    //                 ])
    //                 setUsersCards(prev=>(
    //                     {
    //                         ...prev,
    //                         me: [...prev['me'], new_card]
    //                     }
    //                 ))
    //                 set_enemy_cards_delta(prev=>(
    //                     {
    //                         3 : 11,
    //                         5 : 12,
    //                         4 : 13,
    //                         6 : 14,
    //                     }
    //                 ))
                
    //         })
    //     }
    // )

    const sorted_player_cards = useMemo(
        ()=>{
            let cards : CardType[] = users_cards['me'];
            cards.sort((a, b)=>{
                if (a.suit !== b.suit) {
                    // Проверяем, является ли одна из мастей козырной
                    if (a.suit === trump_card.suit) return 1;
                    if (b.suit === trump_card.suit) return -1;
                    // Если ни одна из мастей не является козырной, просто сравниваем по масти
                    return a.suit - b.suit;
                }
                // Если масти одинаковые, сравниваем по значению
                return a.value - b.value;
            })

            return cards
        },
        [users_cards['me'].length, trump_card.suit]
    )

    return (
        <GameBoardContext.Provider value={{
            cards: game_board,
            setCards: (cards) => {
                setGameBoard(cards)
            }
        }}>
            <div id="game-screen">
                <section id="players" className={`players-count-${players_in_room}`}>
                    {
                        [...next_users, ...prev_users].map((user_id, index) => {

                            if(user_id < 0){
                                return (
                                    <div key={index} className="user-avatar-container">
                                        <EmptyUserAvatar index={-((user_id as number) + 1)} onClick={changeSeat}/>
                                        <center>
                                            <Typography variant="subtitle1" style={{color: '#FFFFFF'}}>
                                                {(start_num + index) % players_in_room + 1}
                                            </Typography>
                                        </center>
                                        
                                    </div>
                                )
                            }

                            return (
                                <div key={index} className="user-avatar-container">
                                    <UserAvatar user_id={user_id}/>
                                    <EnemyCards cards_count={users_cards[user_id] as number} delta={enemy_cards_delta[user_id as keyof EnemyCardDelta]}
                                    index={index}
                                    />
                                    <center>
                                        <Typography variant="subtitle1" style={{color: '#FFFFFF'}}>
                                            {(start_num + index) % players_in_room + 1}
                                        </Typography>
                                    </center>
                                </div>
                            )
                        })
                    }
                </section>
                <CardDeck trump_card={trump_card}/>
                <Bito cards_count={props.bito_count}/>
                {
                    game_state === 2 &&
                    <GameBoard is_transfering={is_transfering}/>
                }
                <PlayerCards 
                cards={sorted_player_cards} 
                throwCard={handleThrowCard}
                transferCard={handleTransfer}
                new_cards={new_cards}
                throw_new_card={throw_new_card}
                />
            </div>
        </GameBoardContext.Provider>
    )
}