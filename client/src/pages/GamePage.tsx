import { GameFooter, GameScreen } from "components/Game"
import 'components/Game/Game.css'

export default function GamePage(){
    return (
        <main id="game-page">
            <GameScreen />
            <GameFooter />
        </main>
    )
}