import styled from "@emotion/styled"
import ForwardIcon from '@mui/icons-material/Forward';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircleIcon from '@mui/icons-material/Circle';
import {Typography} from "@mui/material";
import { CSSProperties } from "react";

function getStyleIcon(color: 'white' | 'blue' | undefined) : CSSProperties {
    if(color === 'white' || !color){
        return {};
    }

    return {
        color: '#4B7297',
        stroke: 'white',
        strokeWidth: '1.5px'
    }
}

function getStyleContainer(color: 'white' | 'blue' | undefined) : CSSProperties {
    if(color === 'white' || !color){
        return {};
    }

    return {
        background: '#4B7297'
    }
}


const IconBox = styled('div')({
    width: '25px',
    height: '35px',
    borderRadius: '7px',
    border: '1px solid white',
    position: 'relative',
})

const HorizontalIconBox = styled(IconBox)({
    width: '35px',
    height: '25px',
})

type Props = {
    disabled?: boolean;
    color?: 'white' | 'blue';
    style?: CSSProperties
}

function PodkidnoiIcon({disabled, color, style}: Props){
    return (
        <IconBox style={{opacity: disabled ? 0.5 : 1, ...getStyleContainer(color), ...style}}>
            <ForwardIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    ...getStyleIcon(color)

                }
            }
            />
        </IconBox>
    )
}

function OnlyNeighborsIcon({disabled, color, style}: Props){
    return (
        <HorizontalIconBox style={{opacity: disabled ? 0.5 : 1, ...getStyleContainer(color), ...style}}>
            <ForwardIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    top: '50%',
                    left: '3px',
                    transform: 'translate(-50%, -50%)',
                    ...getStyleIcon(color)
                }
            }
            />
            <ForwardIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    bottom: '50%',
                    right: '3px',
                    transform: 'translate(-50%, -50%)',
                    rotate: '180deg',
                    ...getStyleIcon(color)
                }
            }
            />
        </HorizontalIconBox>
    )
}

function LoseIcon({disabled, color, style}: Props){
    return (
        <IconBox style={{opacity: disabled ? 0.5 : 1, ...getStyleContainer(color), ...style}}>
            <MoneyOffIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    ...getStyleIcon(color)
                }
            }
            />
        </IconBox>
    )
}

function FirstSpeedIcon({disabled, color, style}: Props){
    return (
        <IconBox style={{border: 'none', opacity: disabled ? 0.5 : 1, ...getStyleContainer(color), ...style}}>
            <PlayArrowIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    ...getStyleIcon(color)
                }
            }
            />
        </IconBox>
    )
}

function SecondSpeedIcon({disabled, color, style}: Props){
    return (
        <IconBox style={{border: 'none', opacity: disabled ? 0.5 : 1, ...getStyleContainer(color), ...style}}>
            <FastForwardIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    ...getStyleIcon(color)
                }
            }
            />
        </IconBox>
    )
} 

function PerevodnoiIcon({disabled, color, style}: Props){
    return (
        <IconBox style={{opacity: disabled ? 0.5 : 1, ...getStyleContainer(color), ...style}}>
            <RefreshIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    ...getStyleIcon(color)
                }
            }
            />
        </IconBox>
    )
}

function AllIcon({disabled, color, style}: Props){
    return (
        <HorizontalIconBox style={{opacity: disabled ? 0.5 : 1, ...getStyleContainer(color), ...style}}>
            <ForwardIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    top: '50%',
                    left: '3px',
                    transform: 'translate(-50%, -50%)',
                    ...getStyleIcon(color)
                }
            }
            />
            <ForwardIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    bottom: '50%',
                    right: '3px',
                    transform: 'translate(-50%, -50%)',
                    rotate: '180deg',
                    ...getStyleIcon(color)
                }
            }
            />
            <ForwardIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    top: '3px',
                    right: '50%',
                    transform: 'translate(-50%, -50%)',
                    rotate: '90deg',
                    ...getStyleIcon(color)
                }
            }
            />
        </HorizontalIconBox>
    )
}

function DrawableIcon({disabled, color, style}: Props){
    return (
        <IconBox style={{opacity: disabled ? 0.5 : 1, ...getStyleContainer(color), ...style}}>
            <CircleIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    top: '25%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 10,
                    ...getStyleIcon(color)
                }
            }
            />
            <CircleIcon color="secondary"
            style={
                {
                    position: 'absolute',
                    bottom: '0',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: 10,
                    ...getStyleIcon(color)
                }
            }
            />
        </IconBox>
    )
}

function TextIcon({text, disabled, color, style}: {text: string} & Props){
    return (
        <IconBox style={{opacity: disabled ? 0.5 : 1, ...getStyleContainer(color), ...style}}>
            <Typography variant="body1" style={{color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold'}}>{text}</Typography>
        </IconBox>
    )
}

export {PodkidnoiIcon, OnlyNeighborsIcon, LoseIcon, FirstSpeedIcon, SecondSpeedIcon, PerevodnoiIcon, AllIcon, DrawableIcon}
export {TextIcon}