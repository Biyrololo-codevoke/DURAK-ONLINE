import CheckIcon from '@mui/icons-material/Check';

export default function Accept(){
    return (
        <div className="game__user_message">
            <CheckIcon style={{color: 'green', fontSize: '25px', fontWeight: 'bold', transform: 'translateY(5px)'}}/>
        </div>
    )
}