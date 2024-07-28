import { Typography } from "@mui/material";

type Props = {
    message: string;
    color: 'white' | 'yellow'
}

export default function TextMessage(props: Props){
    return (
        <div className={`game__user_message game__message_${props.color} game__user_message__shadow`}>
            <Typography
            style={
                {
                    color: 'black',
                    fontSize: '18px'
                }
            }
            >
                {props.message}
            </Typography>
        </div>
    )
}