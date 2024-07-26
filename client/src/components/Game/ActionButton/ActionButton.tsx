import { Button } from '@mui/material';
import './action_button.css';

type Props = {
    children: React.ReactNode;
    onClick: ()=> void;
}

export default function ActionButton(props: Props){
    return (
        <div className='game-action-button'>
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
                {props.children}
            </Button>
        </div>
    )
}