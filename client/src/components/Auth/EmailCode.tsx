import { Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Api as ApiTypes } from "types/";
import {Api as ApiUrls} from "constants/"
import axios from "axios";
import { toast } from "react-toastify";

export default function EmailCode(){

    const navigate = useNavigate();

    const [code, setCode] = useState('');
    const [isCodeChecked, setIsCodeChecked] = useState(true);

    // confirm code
    function checkCode() {
        const body : ApiTypes.ConfirmEmailRequestType = {
            code
        }
        axios.post(ApiUrls.confirmEmail(), body)
        .then(() => {
            setIsCodeChecked(true);
            navigate('/');
        })
        .catch((err) => {
            setIsCodeChecked(false);

            if(err.response?.status === 409){
                toast.error('Пользователь не найден');
            } else if(err.response?.status === 500){
                toast.error('Проблемы с обработкой данных, повторите запрос')
            }
        })
    }

    return (
        <>
            <Typography variant="subtitle2" color="secondary">Мы отправили код подтверждения на вашу почту</Typography>
            <TextField 
            variant="standard" 
            label="Код подтверждения" 
            id="email-code-tf"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            color="secondary"
            error={!isCodeChecked}
            helperText={!isCodeChecked ? 'Неправильный код' : ''}
            autoComplete="off"
            />
            <Button
            variant="outlined"
            color="secondary"
            onClick={checkCode}
            >
                Подтвердить
            </Button>
        </>
    )
}