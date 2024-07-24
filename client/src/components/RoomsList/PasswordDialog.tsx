import { Dialog, TextField, Typography, Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
    room_id: number | null;
    setRoomId: React.Dispatch<React.SetStateAction<number | null>>;
    onSubmit: (password: string) => void;
}

export default function PasswordDialog({room_id, setRoomId, onSubmit}: Props) {

    const navigate = useNavigate();

    const [password, setPassword] = useState('');

    /**
     * проверка кода и перенаправление на страницу с игрой
     */
    function submit() {
        //TODO
        // проверка пароля
        if(!password){
            return
        }

        //подключение к комнате
        localStorage.setItem('_room_id', String(room_id));
        navigate('/game')
    }

    return (
        <Dialog
        open={room_id !== null}
        onClose={() => setRoomId(null)}
        >
            <div id="dialog-container">
                <Typography 
                variant="h5" 
                component="span" 
                style={{color: '#7D7D7D'}}
                >
                    Введите пароль
                    </Typography>
                <TextField
                variant="standard"
                style={{marginTop: '20px', background: '#F5F5F5', width: 200}}
                autoComplete="off"
                sx={
                    {
                        input: {
                            color: '#7D7D7D',
                            fontSize: 50,
                            borderBottom: '2px solid gray'
                        },
                        '& .MuiInputBase-input':{
                            color: '#7D7D7D'
                        },
                        '& .MuiOutlinedInput-root':{
                            '& fieldset': {
                                borderColor: '#7D7D7D'
                            },
                            '&:hover fieldset': {
                                borderColor: '#7D7D7D'
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#7D7D7D'
                            }
                        }
                    }
                }
                color="error"
                value={password}
                onChange={(e) => {
                    let v = e.target.value;
                    if(v.length <= 7){
                        setPassword(v);
                    }
                }}
                />
                <Button
                variant="outlined"
                color="error"
                style={{width: '100%', marginTop: '20px'}}
                onClick={()=>{onSubmit(password)}}
                >
                    Войти
                </Button>
            </div>
        </Dialog>
    )
}