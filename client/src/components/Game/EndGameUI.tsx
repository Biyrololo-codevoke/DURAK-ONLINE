import { Reward } from "types/GameTypes"
import { CSSProperties } from "react"
import { Typography } from "@mui/material"
import MoneyShortName from "features/MoneyShortName"
import Money from "components/Money/MoneyIcon"

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
                        className="game__reward light-shadow"
                        key={index}
                        >
                            {
                                reward.money !== -1 ?
                                <>
                                    <Typography variant="h6" className="reward__money">{MoneyShortName(reward.money)}</Typography>
                                    <Money size="large"/>
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
                width: '50px',
                height: '50px',
                background: 'red'
            }
        }
        className="light-shadow"
        >

        </div>
    )
}