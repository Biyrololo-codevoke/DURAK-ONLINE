import UserAvatar from "./UserAvatar";

export default function GameFooter() {

    const user_id = localStorage.getItem('user_id')

    return (
        <div id="game-footer">
            <UserAvatar user_id={user_id ? parseInt(user_id) : undefined}/>
        </div>
    )
}