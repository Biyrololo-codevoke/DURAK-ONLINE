import { Button, FormHelperText, IconButton, TextField, Typography } from '@mui/material';
import { FormControl, Input, InputAdornment, InputLabel } from '@mui/material';
import { useContext, useState } from 'react';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AuthContext } from 'contexts';
import { Link } from 'react-router-dom';
import { Api as ApiTypes } from 'types';
import { Api as ApiUrls } from 'constants/';
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

export default function UserData() {

    const {onSubmitStep} = useContext(AuthContext);

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    function checkEmail(email: string) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const emailError = !checkEmail(email) && email !== '';

    const passwordError = (password.length < 8 || password.length > 16) && password !== '';

    const usernameError = (username.length < 4 || username.length > 16) && username !== '';

    const isButtonDisabled = email === ''  || password === '' || username === ''
    || emailError || passwordError || usernameError;

    async function submit(){
        const data : ApiTypes.RegisterRequestType = {
            username,
            password,
            email
        }
        axios.post(ApiUrls.registerUser(), data)
        .then(
            res=>{
                const data : ApiTypes.RegisterResponseType = res.data;
                localStorage.setItem('user_id', `${data.user.id}`);
                localStorage.setItem('username', `${data.user.username}`);
                localStorage.setItem('verified', `${data.user.verified}`);
                localStorage.setItem('image_id', `${data.user.image_id}`);
                localStorage.setItem('player_money', `${data.user.money}`);
                if(data.user.image_id === null){
                    localStorage.removeItem('user_photo');
                }
                else{
                    localStorage.setItem('user_photo', `/image/${data.user.image_id}`);
                }

                
                Cookies.set('access_token', data.access_token, {expires: 5});

                // задаю токен, чтобы он юзался при отправке запросов
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

                onSubmitStep(email, password, username);
            }
        )
        .catch(
            err=>{
                let error_message = 'Не удалось зарегистрироваться';
                if(err.response){
                    let error_code = err.response.status;

                    switch(error_code){
                        case 400:
                            error_message = 'Некорректные данные';
                            break;
                        case 409:
                            error_message = 'Пользователь с такой почтой уже существует';
                            break;
                        case 500:
                            error_message = 'Проблемы с обработкой данных, повторите запрос';
                            break;
                    }
                }
                toast.error(error_message)
            }
        )
    }

    return (
        <>
            <Typography variant="subtitle2" color="secondary">Уже зарегистрированы? <Link to="/login" style={{color: 'blue'}}>Войти</Link></Typography>
            <TextField 
            variant="standard" 
            label="Почта" 
            type="email"
            id='email-tf'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            helperText={emailError ? 'Некорректная почта' : ''}
            color="secondary"
            autoComplete="off"
            />
            <FormControl sx={{ width: '100%' }} variant="standard" color='secondary'>
                <InputLabel htmlFor="password-tf" error={passwordError}>Пароль</InputLabel>
                <Input
                    autoComplete='off'
                    id="password-tf"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={passwordError}
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    }
                />
                {
                    passwordError && 
                    <FormHelperText error>
                        Пароль должен содержать от 8 до 16 символов
                    </FormHelperText>
                }
            </FormControl>
            <TextField
            variant="standard"
            label="Имя"
            id='username-tf'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            color="secondary"
            autoComplete="off"
            error={usernameError}
            helperText={usernameError ? 'Имя должно содержать от 4 до 16 символов' : ''}
            />
            <Button 
            onClick={submit} 
            color="secondary" 
            variant="outlined"
            disabled={isButtonDisabled}
            >
                Продолжить
            </Button>
        </>
    )
}