import { getStyles } from "./GameSettings"
import styled from "@emotion/styled"
import { Button, Typography } from "@mui/material"
import { useState, CSSProperties } from "react"
import {isMobile} from "react-device-detect";
import { AllIcon, DrawableIcon, LoseIcon, OnlyNeighborsIcon, PerevodnoiIcon, PodkidnoiIcon } from "components/GameFilters/Icons";
import {CreatingGameContext} from 'contexts' 
import {useContext} from 'react'

function buttonDeviceStyles() : CSSProperties {

    if(isMobile){
        return {
            height: 60,
            fontSize: 14
        }
    }

    return {
    } as CSSProperties
}

const UpperButton = styled(Button)(
    {
        borderRadius: '20px 20px 0 0',
        backgroundColor: 'white',
        color: 'red',
        height: 100,
        fontSize: 14,
        textTransform: 'none',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',

        ...buttonDeviceStyles()
    }
)

const BottomButton = styled(UpperButton)(
    {
        borderRadius: '0 0 20px 20px',
    }
)

export default function GameVariants() {

    const callbacks = useContext(CreatingGameContext);

    const [is_transfering, setIsTransfering] = useState(false); // подкидной / переводной
    const [all_tossing, setAllTossing] = useState(false); // все ли могут подкидывать
    const [is_classic, setIsClassic] = useState(true); // классическая или ничья

    return (
        <div className="create-card-padding-container">
            <center style={{margin: '10px 0'}}>
                <Typography variant="h5" component="span" style={{color: '#FFFFFF'}}>
                    Режим игры
                </Typography>
            </center>
            <div className="d-flex jc-center g-20 mt-20">
                <section className="game-variants-column">
                    <UpperButton 
                    variant="contained" 
                    style={getStyles(!is_transfering)}
                    color="secondary"
                    onClick={() => {
                        setIsTransfering(false);
                        callbacks.setIsTransfering(false);
                    }}
                    >
                        <PodkidnoiIcon color={!is_transfering ? 'blue' : 'white'}/>
                        подкидной
                    </UpperButton>

                    <BottomButton 
                    variant="contained" 
                    style={getStyles(is_transfering)}
                    color="secondary"
                    onClick={() => {
                        setIsTransfering(true)
                        callbacks.setIsTransfering(true);
                    }}
                    >
                        <PerevodnoiIcon color={is_transfering ? 'blue' : 'white'}/>
                        переводной
                    </BottomButton>
                </section>
                <section className="game-variants-column">
                    <UpperButton 
                    variant="contained" 
                    style={getStyles(!all_tossing)}
                    color="secondary"
                    onClick={() => {
                        setAllTossing(false)
                        callbacks.setAllTossing(false);
                    }}
                    >
                        <OnlyNeighborsIcon color={!all_tossing ? 'blue' : 'white'}/>
                        соседи
                    </UpperButton>

                    <BottomButton 
                    variant="contained" 
                    style={getStyles(all_tossing)}
                    color="secondary"
                    onClick={() => {
                        setAllTossing(true)
                        callbacks.setAllTossing(true);
                    }}
                    >
                        <AllIcon color={all_tossing ? 'blue' : 'white'}/>
                        все
                    </BottomButton>
                </section>
                <section className="game-variants-column">
                    <UpperButton 
                    variant="contained" 
                    style={getStyles(is_classic)}
                    color="secondary"
                    onClick={() => {
                        setIsClassic(true)
                        callbacks.setIsClassic(true);
                    }}
                    >
                        <LoseIcon color={is_classic ? 'blue' : 'white'}/>
                        классика
                    </UpperButton>

                    <BottomButton 
                    variant="contained" 
                    style={getStyles(!is_classic)}
                    color="secondary"
                    onClick={() => {
                        setIsClassic(false)
                        callbacks.setIsClassic(false);
                    }}
                    >
                        <DrawableIcon color={!is_classic ? 'blue' : 'white'}/>
                        ничья
                    </BottomButton>
                </section>
            </div>
        </div>
    )
}