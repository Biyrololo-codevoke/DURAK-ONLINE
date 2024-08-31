import GamePrice from "components/CreateGame/GamePrice";
import 'components/CreateGame/CreateGame.css';
import { Button, Typography } from "@mui/material";
import GameSettings from "components/CreateGame/GameSettings";
import GameVariants from "components/CreateGame/GameVariants";
import GamePassword from "components/CreateGame/GamePassword";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {CreatingGameContext} from 'contexts' 
import { useState } from "react";
import { PRICES } from "constants/Prices";
import { Api as ApiTypes } from "types/";
import { Api as ApiUrls } from "constants/";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function CreateGamePage() {

    const navigate = useNavigate();

    const [players_count, setPlayersCount] = useState(2);
    const [cards_count, setCardsCount] = useState(24);
    const [game_speed, setGameSpeed] = useState<1 | 2>(1);

    const [is_classic, setIsClassic] = useState<boolean>(true);
    const [is_transfering, setIsTransfering] = useState<boolean>(false);
    const [all_tossing, setAllTossing] = useState<boolean>(false);
    
    const [game_price, setGamePrice] = useState(PRICES[1]);

    const [password, setPassword] = useState<string | false>(false);

    const [is_loading, set_is_loading] = useState(false);

    /**
     * Создание игры
     */
    async function handle_create_game() {

        if(password === '') {
            toast.error('Пароль не может быть пустым');
            return;
        }

        if(typeof(password) === 'string' && password.length < 4){
            toast.error('Длина пароля должна быть от 4 до 6');
            return
        }

        set_is_loading(true);

        const body : ApiTypes.CreateRoomRequestType = {
            reward: game_price,
            players_count,
            cards_count,
            speed: game_speed,
            game_type: is_transfering ? 'translate' : 'throw',
            throw_type: all_tossing ? 'all' : 'neighborhood',
            win_type: is_classic ? 'classic' : 'draw',
            private: password !== false,
            password: password || null
        }
        axios.post(ApiUrls.createRoom(), body)
        .then(
            res=>{
                const data : ApiTypes.CreateRoomResponseType = res.data;
                localStorage.setItem('_room_id', String(data.room.id));
                localStorage.setItem('_game_key', data.key);
                setTimeout(
                    ()=>{
                        navigate(`/game`);
                    },
                    1000
                )
            }
        )
        .catch(
            err=>{
                console.log(err);

                if(err.response?.status === 500) {
                    toast.error('Проблемы с обработкой данных, повторите запрос')
                } else {
                    toast.error('Ошибка при создании комнаты')
                }

                set_is_loading(false);
            }
        )
    }

    return (
        <main>
            <center className="bs-border-box bg-white p-10">
                <Typography 
                variant="h4" 
                component="span" 
                style={{color: '#818181'}}
                >
                    Создать игру
                </Typography>
            </center>
            <CreatingGameContext.Provider
            value={{
                players_count,
                cards_count,
                game_speed,
                is_classic,
                is_transfering,
                all_tossing,
                game_price,

                setPlayersCount,
                setCardsCount,
                setGameSpeed,
                setIsClassic,
                setIsTransfering,
                setAllTossing,
                setGamePrice
            }}>
                <GamePrice />
                <GameSettings />
                <GameVariants />
            </CreatingGameContext.Provider>
            <div className="create-card-padding-container d-flex jc-space-between mt-10">
                <GamePassword callback={setPassword}/>
                <Button
                variant="text"
                color="secondary"
                onClick={handle_create_game}
                disabled={is_loading}
                style={
                    {
                        boxShadow: `rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px`,
                        borderRadius: '50px',
                        padding: '10px 20px',
                    }
                }
                >
                    Создать
                    <PlayArrowIcon />
                </Button>
            </div>
        </main>
    )
}
