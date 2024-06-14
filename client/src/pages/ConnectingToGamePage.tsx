import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom"

export default function ConnectingToGamePage() {

    const {room_id} = useParams()

    const navigate = useNavigate()

    useEffect(
        () => {
            // TODO try to connect to game
            navigate('/game')
        },
        []
    )

    return (
        <main>
            Подключение к игре
        </main>
    )
}