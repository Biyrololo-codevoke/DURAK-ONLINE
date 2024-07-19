import styled from "@emotion/styled"
import { Button, Typography } from "@mui/material"
import { CSSProperties, useState } from "react"
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import {isMobile} from "react-device-detect";

function getStyles(is_active: boolean) : CSSProperties {
    if(is_active){
        return {
            color: 'red'
        }
    }

    return {
        color: 'white',
        background: 'rgba(0, 0, 0, 0)'
    }
}

export {getStyles}

function buttonDeviceStyles() : CSSProperties {

    if(isMobile){
        return {
            height: 35,
            fontSize: 14
        }
    }

    return {
        height: 50,
        fontSize: 20
    }
}

const RadioButton = styled(Button)(
    {
        backgroundColor: 'white',
        color: 'red',
        borderRadius: '0',
        height: 50,
        fontSize: 20,
        fontWeight: 'bold',
        ...buttonDeviceStyles()
    }
)

const LeftRButton = styled(RadioButton)(
    {
        borderRadius: '50px 0 0 50px',
    }
)

const RightRButton = styled(RadioButton)(
    {
        borderRadius: '0 50px 50px 0',
    }
)

const PLAYERS_COUNT = [2, 3, 4, 5, 6];
const CARDS_COUNT = [24, 36, 52]

export default function GameSettings(){

    const [playersCount, setPlayersCount] = useState<number[]>(JSON.parse(localStorage.getItem('players_count') || '[2, 3, 4, 5, 6]') as number[]);

    const [cardsCount, setCardsCount] = useState<number[]>(JSON.parse(localStorage.getItem('cards_count') || '[24, 36, 52]') as number[]);

    const [gameSpeed, setGameSpeed] = useState<number[]>(JSON.parse(localStorage.getItem('game_speed') || '[1, 2]') as number[]);

    return (
        <div className="create-card-padding-container">
            <section>
                <BlockTitle title="Количество игроков"/>
                <div className="d-flex settings-buttons">
                    {
                        PLAYERS_COUNT.map((count, index) => {

                            let Component = RadioButton;

                            if(index === 0){
                                Component = LeftRButton
                            }

                            if(index === PLAYERS_COUNT.length - 1){
                                Component = RightRButton
                            }

                            return (
                                <Component
                                key={count}
                                onClick={() => {
                                    if(playersCount.includes(count)){
                                        setPlayersCount(playersCount.filter((value) => value !== count));
                                        localStorage.setItem('players_count', JSON.stringify(playersCount.filter((value) => value !== count)));
                                    } else {
                                        setPlayersCount([...playersCount, count]);
                                        localStorage.setItem('players_count', JSON.stringify([...playersCount, count]));
                                    }
                                }}
                                variant="contained"
                                color="secondary"
                                style={getStyles(playersCount.includes(count))}
                                className="responsive-button"
                                >
                                    {count}
                                </Component>
                            )

                        })
                    }
                </div>
            </section>
            <div className="d-flex g-20 jc-space-between">
                <section className="fg-2">
                    <BlockTitle title="Колода"/>
                    <div className="d-flex settings-buttons">
                        {
                            CARDS_COUNT.map((count, index) => {

                                let Component = RadioButton;

                                if(index === 0){
                                    Component = LeftRButton
                                }

                                if(index === CARDS_COUNT.length - 1){
                                    Component = RightRButton
                                }

                                return (
                                    <Component
                                    key={count}
                                    onClick={() => {
                                        if(cardsCount.includes(count)){
                                            setCardsCount(cardsCount.filter((value) => value !== count))
                                            localStorage.setItem('cards_count', JSON.stringify(cardsCount.filter((value) => value !== count)))
                                        } else {
                                            setCardsCount([...cardsCount, count])
                                            localStorage.setItem('cards_count', JSON.stringify([...cardsCount, count]))
                                        }
                                    }}
                                    variant="contained"
                                    color="secondary"
                                    style={getStyles(cardsCount.includes(count))}
                                    className="responsive-button"
                                    >
                                        {count}
                                    </Component>
                                )
                            })
                        }
                    </div>
                </section>
                <section className="fg-1">
                    <BlockTitle title="Скорость"/>
                    <div className="d-flex settings-buttons">
                        <LeftRButton
                        onClick={() => {
                            if(gameSpeed.includes(1)){
                                setGameSpeed(gameSpeed.filter((value) => value !== 1))
                            } else {
                                setGameSpeed([...gameSpeed, 1])
                            }
                        }}
                        variant="contained"
                        color="secondary"
                        style={getStyles(gameSpeed.includes(1))}
                        className="responsive-button"
                        >
                            <PlayArrowIcon />
                        </LeftRButton>
                        <RightRButton
                        onClick={() => {
                            if(gameSpeed.includes(2)){
                                setGameSpeed(gameSpeed.filter((value) => value !== 2))
                                localStorage.setItem('game_speed', JSON.stringify(gameSpeed.filter((value) => value !== 2)))
                            } else {
                                setGameSpeed([...gameSpeed, 2])
                                localStorage.setItem('game_speed', JSON.stringify([...gameSpeed, 2]))
                            }
                        }}
                        variant="contained"
                        color="secondary"
                        style={getStyles(gameSpeed.includes(2))}
                        className="responsive-button"
                        >
                            <FastForwardIcon />
                        </RightRButton>
                    </div>
                </section>
            </div>
        </div>
    )
}

function BlockTitle(props: {title: string}) {
    return (
        <center style={{margin: '15px 0 10px 0'}}>
            <Typography variant="h5" component="span" style={{color: '#FFFFFF'}}>
                {props.title}
            </Typography>
        </center>
    )
}