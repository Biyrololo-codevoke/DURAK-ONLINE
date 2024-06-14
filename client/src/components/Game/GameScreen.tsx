import {useEffect, useMemo, useState} from "react";
import UserAvatar, {EmptyUserAvatar} from "./UserAvatar";
import { Typography } from "@mui/material";
import { CardType, GameBoardCard } from "types/GameTypes";
import PlayerCards from "./PlayerCards";
import CardDeck from "./CardDeck";
import EnemyCards from "./EnemyCards";
import {GameBoardContext} from "contexts/game";
import GameBoard from "./Board";

type UserIdType = number | 'me'

type UserCards = {
    'me' : CardType[],
    [key : number]: number
}

type EnemyCardDelta = {
    [key : number]: number
}

export default function GameScreen(){

    const is_transfering = true;

    const [users_ids, setUsersIds] = useState<UserIdType[]>(
        [3, 5, 'me', 4, 6]
    );

    const [trump_card, setTrumpCard] = useState<CardType>(
        {
            suit: 2,
            value: 11
        }
    )

    const [users_cards, setUsersCards] = useState<UserCards>({
        3 : 4,
        5 : 7,
        'me' : [
            {suit: 3, value: 10},
            {suit: 3, value: 9},
            {suit: 3, value: 8},
            {suit: 2, value: 7},
            {suit: 2, value: 14},
            {suit: 1, value: 14},
            {suit: 4, value: 13},
        ],
        4 : 4,
        6 : 8
    })


    const players_in_room = 5;

    const start_num = users_ids.indexOf('me')! % players_in_room + 1;

    function changeSeat(newSeat : number){
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

    const [game_board, setGameBoard] = useState<GameBoardCard[]>([
            {
                lower: {
                    suit: 4,
                    value: 1
                },
                upper: {
                    suit: 3,
                    value: 13
                }
            },
            {
                lower: {
                    suit: 2,
                    value: 5
                },
            },
            {
                lower: {
                    suit: 1,
                    value: 2
                },
            },
            {
                lower: {
                    suit: 4,
                    value: 5
                },
                upper: {
                    suit: 3,
                    value: 7
                }
            },
        ],
    )

    function handleThrowCard(lower_card: CardType, upper_card: CardType){
        setGameBoard((prev) => {
            return prev.map(
                (c) => {
                    if(c.lower.value === lower_card.value && c.lower.suit === lower_card.suit){
                        return {
                            ...c,
                            upper: upper_card
                        }
                    }
                    return c
                }
            )
        })

        setUsersCards((prev) => {
            return {
                ...prev,
                'me': [...prev['me'].filter((card, index) => !(card.suit === upper_card.suit && card.value === upper_card.value))]
            }
        })
    }

    function handleTransfer(card: CardType){

        // console.log('новая карта', users_cards['me'][card_index], card_index, users_cards['me'])

        setGameBoard((prev)=>{
            return [...prev, {lower: card}]
        })

        console.log('game board', game_board)
        
        setUsersCards((prev) => {
            return {
                ...prev,
                'me': [...prev['me'].filter((c, index) => !(c.suit === card.suit && c.value === card.value))]
            }
        })


        // console.log('мои новые карты', [...users_cards['me'].filter((card, index) => index !== card_index)])
    }

    const [new_cards, set_new_cards] = useState<CardType[]>([
        {suit: 3, value: 10},
        {suit: 3, value: 9},
        {suit: 3, value: 8},
        {suit: 2, value: 7},
        {suit: 2, value: 14},
        {suit: 1, value: 14},
        {suit: 4, value: 13},
    ]);

    const [enemy_cards_delta, set_enemy_cards_delta] = useState<EnemyCardDelta>(
        {
            3 : 10,
            5 : 20,
            4 : 40,
            6 : 60,
        }
    )

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
                <GameBoard is_transfering={is_transfering}/>
                <PlayerCards 
                cards={sorted_player_cards} 
                throwCard={handleThrowCard}
                transferCard={handleTransfer}
                new_cards={new_cards}
                />
            </div>
        </GameBoardContext.Provider>
    )
}