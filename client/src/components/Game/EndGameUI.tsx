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
                            <Typography variant="h4">{reward.money}</Typography>
                            <img src="/static/currency.png" alt="currency" className='currency'/>
                        </div>
                    )
                })
            }
        </div>
    )
}