import { Reward } from "types/GameTypes"
import { CSSProperties } from "react"
import { Typography } from "@mui/material"

type Props = {
    rewards: Reward[]
}

export default function EndGameUI({rewards}: Props) {
    return (
        <div id="rewards">
            {
                rewards.map((reward, index) => {
                    return (
                        <div
                        style={
                            {
                                '--reward-x': `${reward.x}px`,
                                '--reward-y': `${reward.y}px`
                            } as CSSProperties
                        }
                        className="game__reward"
                        key={index}
                        >
                            {
                                reward.money !== -1 ?
                                <>
                                    <Typography variant="h4">{reward.money}</Typography>
                                    <img src="/static/currency.png" alt="currency" className='currency'/>
                                </> :
                                <LooserImg/>
                            }
                        </div>
                    )
                })
            }
        </div>
    )
}

function LooserImg(){
    return (
        <div style={
            {
                width: '40px',
                height: '40px',
                background: 'red'
            }
        }>

        </div>
    )
}