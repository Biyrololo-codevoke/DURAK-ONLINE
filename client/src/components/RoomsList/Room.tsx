import { IconButton, Typography } from "@mui/material"
import {Room} from "types"
import {PRICES, PRICES_LABELS} from "constants/Prices"
import {MoneyIcon} from "components/Money"
import { AllIcon, DrawableIcon, LoseIcon, OnlyNeighborsIcon, PerevodnoiIcon, PodkidnoiIcon, SecondSpeedIcon, TextIcon } from "components/GameFilters/Icons";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { CSSProperties } from "react";
import { isMobile } from "react-device-detect";
import { Link } from "react-router-dom";

const style : CSSProperties = {
    opacity: 0.5,
    scale: isMobile ? '0.7' : '0.8'
}

const fontSize : 'h6' | 'subtitle1' = isMobile ? 'subtitle1' : 'h6';
const titleFontSize: 'h5' | 'h6' = isMobile ? 'h6' : 'h5';


export default function RoomComponent(room: Room & {onClick: (room_id: number) => void}) {

    const price_index = PRICES.indexOf(room.game_price);

    const price_label = PRICES_LABELS[price_index];

    function handleSetRoomId(){
        localStorage.setItem('_room_id', String(room.id));
    }

    return (
            <section className="room" onClick={()=>{room.onClick(room.id)}}>
                <center>
                    <Typography
                        variant={titleFontSize}
                        component="span"
                        style={{ color: 'white' }}
                    >
                        {room.title}
                    </Typography>
                </center>
                <div className="room-info">
                    <section>
                        <Typography
                            variant={fontSize}
                            component="span"
                            style={{ color: 'white' }}
                        >
                            {price_label}
                        </Typography>
                        <MoneyIcon size="small" 
                        style={{opacity: 0.5}}
                        />
                        
                        <Typography
                            variant={fontSize}
                            component="span"
                            style={{ color: 'white' }}
                        >
                            {`${room.currcent_player_count}/${room.players_count}`}
                        </Typography>
                        <PersonOutlineIcon color="secondary" className="room-controlled-opacity"/>
                    </section>
                    <section>
                        <DoubleSpeed speed={room.game_speed}/>
                        <TextIcon
                        style={style}
                        text={room.cards_count.toString()}
                        />
                        <GameTransfering is_transfering={room.is_transfering}/>
                        <GameTossing all_tossing={room.all_tossing}/>
                        <GameClassic is_classic={room.is_classic}/>
                        <IconButton
                        style={
                            {
                                boxShadow: `rgba(0, 0, 0, 0.35) 0px 5px 15px`
                            }
                        }
                        >
                            <ArrowForwardIosIcon
                            style={{
                                fontSize: isMobile ? 10 : 15,
                            }}
                            />
                        </IconButton>
                    </section>
                </div>
            </section>
    )

}

function DoubleSpeed({speed}: {speed: 1 | 2}) {
    if(speed === 1) {
        return null;
    }

    return <SecondSpeedIcon style={{opacity: 0.5}}/>
}

function GameTransfering({is_transfering}: {is_transfering: boolean}) {
    if(is_transfering) {
        return <PerevodnoiIcon style={style}/>
    }

    return <PodkidnoiIcon style={style}/>
}

function GameTossing({all_tossing}: {all_tossing: boolean}) {
    if(all_tossing) {
        return <AllIcon style={style}/>
    }

    return <OnlyNeighborsIcon style={style}/>
}

function GameClassic({is_classic}: {is_classic: boolean}) {
    if(is_classic) {
        return <LoseIcon style={style}/>
    }

    return <DrawableIcon style={style}/>
}