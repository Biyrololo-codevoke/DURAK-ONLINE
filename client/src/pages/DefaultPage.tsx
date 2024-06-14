import { useEffect } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

export default function DefaultPage(){

    const navigate = useNavigate();

    useEffect(
        ()=>{
            const access_token = Cookies.get('access_token')
            if(access_token){
                navigate('/profile')
            }
            else{
                navigate('/login')
            }
        },
        []
    )

    return (<></>)
}