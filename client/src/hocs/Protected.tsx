import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Cookies from 'js-cookie';

type Props = {
    children: React.ReactNode
}

export default function Protected({ children }: Props) {
    const navigate = useNavigate()
    const access_token = Cookies.get('access_token');
    
    useEffect(() => {
        if (!access_token) {
            navigate('/login')
        }
    }, [access_token, navigate])

    if (!access_token) {
        return null
    }

    return <>{children}</>
}
