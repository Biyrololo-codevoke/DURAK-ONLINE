import { Button, Typography } from '@mui/material';
import './action_button.css';

type Props = {
    label: string;
    onClick: ()=> void;
    text?: boolean
}

export default function ActionButton(props: Props){

    const {text} = props;

    return (
        <div className='game-action-button'>
            {
                text ? 
                <Typography
                style={{color: 'red', fontSize: '30px'}}
                >
                    {props.label}
                </Typography>
                :
                <Button 
                onClick={props.onClick} 
                color='error'
                style={
                    {
                        border: '1px rgba(0, 0, 0, .2) solid',
                        fontSize: '30px'
                    }
                }
                >
                    {props.label}
                </Button>
            }
        </div>
    )
}