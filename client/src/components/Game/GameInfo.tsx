import { Typography } from "@mui/material";
import { PerevodnoiIcon, PodkidnoiIcon } from "components/GameFilters/Icons";
import { OnlyNeighborsIcon, AllIcon } from "components/GameFilters/Icons";
import { DrawableIcon, LoseIcon } from "components/GameFilters/Icons";
import { FirstSpeedIcon, SecondSpeedIcon } from "components/GameFilters/Icons";
import Money from "components/Money/MoneyIcon";
import RoomContext from "contexts/game/RoomContext";
import MoneyShortName from "features/MoneyShortName";
import numberWithSpaces from "features/NumberWithSpaces";
import { useContext } from "react";
import { RoomResponseType } from "types/ApiTypes";

export default function GameInfo(){

    const room = useContext(RoomContext);

    return (
        <>
        
            <section id='game-info'>
                {
                    room.game_type === 'throw' ?
                    <PodkidnoiIcon/> :
                    <PerevodnoiIcon/>
                }
                {
                    room.throw_type === 'all' ?
                    <AllIcon/> :
                    <OnlyNeighborsIcon />
                }
                {
                    room.win_type === 'classic' ? 
                    <LoseIcon /> :
                    <DrawableIcon />
                }
                {
                    room.speed === 1 ?
                    <FirstSpeedIcon /> :
                    <SecondSpeedIcon />
                }
            </section>
            <div id="__game-reward">
                <Typography variant="h4" style={{color: 'white'}}>
                    {MoneyShortName(room.reward)}
                </Typography>
                <Money />
            </div>
        </>
    )
}