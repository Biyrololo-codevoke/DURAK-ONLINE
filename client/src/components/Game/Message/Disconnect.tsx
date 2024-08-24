import WifiOffIcon from '@mui/icons-material/WifiOff';

export default function Disconnect() {
    return (
        <div className="game__user_message game_user_message__bottom">
            <WifiOffIcon style={{color: 'gray', fontSize: '25px', fontWeight: 'bold', transform: 'translateY(-5px)'}}/>
        </div>
    )
}