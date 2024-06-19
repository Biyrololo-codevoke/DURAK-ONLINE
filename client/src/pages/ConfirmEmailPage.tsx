import EmailCode from "components/Auth/EmailCode";
import { useEffect } from "react";

import { useNavigate } from "react-router-dom";

export default function ConfirmEmailPage(){

    const is_verified = localStorage.getItem('verified') === 'true';
    
    const navigate = useNavigate();

    useEffect(
        ()=>{
            if(is_verified) navigate('/');
        },
        []
    )


    return (
        <main id="auth-page">
            <div id="auth-form">
                <EmailCode />
            </div>
        </main>
    )
}