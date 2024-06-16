import { IconButton, TextField } from "@mui/material";
import { useState } from "react";
import CheckIcon from '@mui/icons-material/Check';

export default function UsernameInput(){

    const def_username = localStorage.getItem('username') || '!!!ОШИБКА!!!';

    const [username, setUsername] = useState<string>(def_username);

    // Request to change username
    function handle_change_username(){
        // todo 
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
                    localStorage.setItem('username', username);
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