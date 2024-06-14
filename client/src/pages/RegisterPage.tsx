import { Typography } from '@mui/material';
import './Auth.css';
import { useState } from 'react';
import UserData from 'components/Auth/UserData';
import AuthContext from 'contexts/AuthContext';
import EmailCode from 'components/Auth/EmailCode';

export default function RegisterPage() {


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [curStep, setCurStep] = useState(0);

    function onSubmitStep(email: string, password: string, username: string) {
        setEmail(email);
        setPassword(password);
        setUsername(username);
        setCurStep(step => step + 1);
    }

    return (
        <AuthContext.Provider value={{onSubmitStep, email, password, username}}>
            <main id="auth-page">
                <div id="auth-form">
                    <Typography variant="h3" color="secondary">Регистрация</Typography>
                    {
                        curStep === 0 ? 
                        <UserData /> :
                        <EmailCode />
                    }
                </div>
            </main>
        </AuthContext.Provider>
    )
}