import './Settings.css'
import UploadPhoto from './UploadPhoto'
import UsernameInput from './UsernameInput'

export default function Settings(){
    return (
        <div id="settings-container">
            <UsernameInput />
            <UploadPhoto />
        </div>
    )
}