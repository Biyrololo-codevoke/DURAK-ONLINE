import { getStyles } from "./GameSettings"
import styled from "@emotion/styled"
import { Button, Typography } from "@mui/material"
import { useState, CSSProperties } from "react"
import {isMobile} from "react-device-detect";
import { AllIcon, DrawableIcon, LoseIcon, OnlyNeighborsIcon, PerevodnoiIcon, PodkidnoiIcon } from "components/GameFilters/Icons";

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

type ValueType = 1 | 2 | 3;

function setNewValue(cur_value : ValueType, value: ValueType, setter: React.Dispatch<React.SetStateAction<ValueType>>, name: string) {
    if(cur_value === value){
        return
    }
    if(cur_value === 3){
        setter((3 - value) as ValueType);
        localStorage.setItem(name, (3 - value).toString());
        return;
    }
    setter(3);
    localStorage.setItem(name, '3');
}

export default function GameVariants() {

    const [is_transfering, setIsTransfering] = useState<ValueType>(parseInt(localStorage.getItem('is_transfering') || '3') as ValueType); // подкидной / переводной
    const [all_tossing, setAllTossing] = useState<ValueType>(parseInt(localStorage.getItem('all_tossing') || '3') as ValueType); // все ли могут подкидывать
    const [is_classic, setIsClassic] = useState<ValueType>(parseInt(localStorage.getItem('is_classic') || '3') as ValueType); // классическая или ничья

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
                    style={getStyles(is_transfering !== 2)}
                    color="secondary"
                    onClick={() => setNewValue(is_transfering, 1, setIsTransfering, 'is_transfering')}
                    >
                        <PodkidnoiIcon color={is_transfering !== 2 ? 'blue' : 'white'}/>
                        подкидной
                    </UpperButton>

                    <BottomButton 
                    variant="contained" 
                    style={getStyles(is_transfering !== 1)}
                    color="secondary"
                    onClick={() => setNewValue(is_transfering, 2, setIsTransfering, 'is_transfering')}
                    >
                        <PerevodnoiIcon color={is_transfering !== 1 ? 'blue' : 'white'}/>
                        переводной
                    </BottomButton>
                </section>
                <section className="game-variants-column">
                    <UpperButton 
                    variant="contained" 
                    style={getStyles(all_tossing !== 2)}
                    color="secondary"
                    onClick={() => setNewValue(all_tossing, 1, setAllTossing, 'all_tossing')}
                    >
                        <OnlyNeighborsIcon color={all_tossing !== 2 ? 'blue' : 'white'}/>
                        соседи
                    </UpperButton>

                    <BottomButton 
                    variant="contained" 
                    style={getStyles(all_tossing !== 1)}
                    color="secondary"
                    onClick={() => setNewValue(all_tossing, 2, setAllTossing, 'all_tossing')}
                    >
                        <AllIcon color={all_tossing !== 1 ? 'blue' : 'white'}/>
                        все
                    </BottomButton>
                </section>
                <section className="game-variants-column">
                    <UpperButton 
                    variant="contained" 
                    style={getStyles(is_classic !== 2)}
                    color="secondary"
                    onClick={() => setNewValue(is_classic, 1, setIsClassic, 'is_classic')}
                    >
                        <LoseIcon color={is_classic !== 2 ? 'blue' : 'white'}/>
                        классика
                    </UpperButton>

                    <BottomButton 
                    variant="contained" 
                    style={getStyles(is_classic !== 1)}
                    color="secondary"
                    onClick={() => setNewValue(is_classic, 2, setIsClassic, 'is_classic')}
                    >
                        <DrawableIcon color={is_classic !== 1 ? 'blue' : 'white'}/>
                        ничья
                    </BottomButton>
                </section>
            </div>
        </div>
    )
}