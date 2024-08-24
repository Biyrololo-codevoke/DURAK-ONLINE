import './Auth.css';
import { useState } from 'react';
import { Button, IconButton, TextField, Typography } from '@mui/material';
import { FormControl, Input, InputAdornment, InputLabel } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Api as ApiTypes} from 'types/';
import { Api as ApiUrls} from 'constants/';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

export default function LoginPage(){

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function checkEmail(email: string) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    const emailError = !checkEmail(email) && email !== '';

    /**
     * try to login
     */
    async function submit(){
        const body : ApiTypes.LoginRequestType = {
            email,
            password
        }
        axios.post(ApiUrls.loginUser(), body)
        .then(
            res=>{
                const data : ApiTypes.LoginResponseType = res.data;

                // запоминаю данные юзера
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('user_id', `${data.user.id}`);
                localStorage.setItem('verified', `${data.user.verified}`);
                Cookies.set('access_token', data.access_token, {expires: 5});

                // задаю токен, чтобы он юзался при отправке запросов
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

                return axios.get(`/user?id=${data.user.id}`)
            }
        )
        .then(
            res=>{
                const data : ApiTypes.GetUserResponseType = res.data;
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('verified', `${data.user.verified}`);
                localStorage.setItem('user_id', `${data.user.id}`);
                localStorage.setItem('image_id', `${data.user.image_id}`);
                localStorage.setItem('player_money', `${data.user.money}`);
                if(data.user.image_id === null){
                    localStorage.removeItem('user_photo');
                }
                else{
                    localStorage.setItem('user_photo', `/api/image/${data.user.image_id}`);
                }

                if(!data.user.verified){
                    navigate('/confirm-email');
                    return;
                }

                // перекидываем на дефолтную страницу
                navigate('/');
            }
        )
        .catch(
            (err)=>{
                let error_message = 'Не удалось войти'
                if(err.response){
                    let error_code = err.response.status;

                    switch(error_code){
                        case 400:
                            error_message = 'Неверный пароль';
                            break;
                        case 404:
                            error_message = 'Пользователь не найден';
                            break;
                        case 500:
                            error_message = 'Проблемы с обработкой данных, повторите запрос';
                            break;
                    }
                }
                toast.error(error_message);
                
            }
        )
    }

    return (
        <main id="auth-page">
            <div id="auth-form">
                <Typography variant="h3" color="secondary" textAlign={'center'}>Вход</Typography>
                <Typography variant="subtitle2" color="secondary">Ещё нет аккаунта? <Link to="/register" style={{color: 'blue'}}>Зарегистрируйтесь</Link></Typography>
                <TextField 
                autoComplete='off'
                variant="standard" 
                label="Почта" 
                type="email"
                id='email-tf'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={emailError}
                helperText={emailError ? 'Некорректная почта' : ''}
                color="secondary"
                />
                <FormControl sx={{ width: '100%' }} variant="standard" color='secondary'>
                    <InputLabel htmlFor="password-tf">Пароль</InputLabel>
                    <Input
                        autoComplete='off'
                        id="password-tf"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                </FormControl>
                <Button 
                onClick={submit} 
                color="secondary" 
                variant="outlined"
                disabled={emailError || password === ''}
                >
                    Войти
                </Button>
            </div>
        </main>
    )
}