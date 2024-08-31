import { IconButton, TextField } from "@mui/material";
import { useState } from "react";
import CheckIcon from '@mui/icons-material/Check';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function UsernameInput(){

    const navigate = useNavigate();

    const def_username = localStorage.getItem('username') || '!!!ОШИБКА!!!';

    const [username, setUsername] = useState<string>(def_username);

    // Request to change username
    async function handle_change_username(){
        axios.patch("/user", {
            username
        })
        .then(
            res => {
                localStorage.setItem('username', username);
                navigate(0);
            }
        )
        .catch(
            err => {
                console.log(err);

                if(err.response?.status === 500){
                    toast.error('Проблемы с обработкой данных, повторите запрос');
                }
            }
        )
    }

    return (
        <section>
            <TextField
            fullWidth
            variant="filled"
            placeholder="Имя пользователя"
            autoComplete="off"
            color="secondary"
            inputProps={{style: {fontSize: 20}}}
            style={
                {
                    borderRadius: '60px'
                }
            }
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => {
                if(e.key === 'Enter'){
                    handle_change_username();
                }
            }}
            InputProps={
                {
                    endAdornment: username !== def_username && 
                    <IconButton
                    style={
                        {
                            background: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                    onClick={handle_change_username}
                    >
                        <CheckIcon />
                    </IconButton>,
                    style: {
                        borderRadius: '30px 30px 0px 0px'
                    }
                }
            }
            />
        </section>
    )
}