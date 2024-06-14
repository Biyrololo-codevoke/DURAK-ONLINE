import { Checkbox, TextField, Typography } from "@mui/material";
import { useState } from "react";

type Props = {
    callback: (password: string | false) => void
}

export default function GamePassword({callback}: Props) {

    const [is_password, setIsPassword] = useState(false);

    const [password, setPassword] = useState('');

    return (
        <div className="d-flex ai-center">
            <Checkbox
            checked={is_password}
            onChange={() => {
                if(is_password) {
                    callback(false);
                }
                else{
                    callback(password);
                }
                setIsPassword(!is_password);
            }}
            color="secondary"
            size="large"
            />
            <Typography 
            variant="h6"
            component="span"
            color="secondary"
            >
                Пароль
            </Typography>
            <TextField
            variant="standard"
            value={password}
            onChange={(e) => {
                const value = e.target.value;
                if(value.length <= 6) {
                    setPassword(value);
                    callback(value);
                }
            }}
            autoComplete="off"
            disabled={!is_password}
            style={{width: '60px', marginLeft: '10px'}}
            />
        </div>
    )
}