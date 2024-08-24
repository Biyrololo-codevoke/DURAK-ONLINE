import Accept from "./Accept";
import Disconnect from "./Disconnect";
import TextMessage from "./TextMessage";

type Props = {
    type: 'text';
    message: string;
    color: 'white' | 'yellow'
} | {
    type: 'accept'
} | {
    type: 'disconnect'
}

export default function Message(props: Props){
    
    if(props.type === 'text'){
        return (
            <>
                <TextMessage 
                message={props.message}
                color={props.color}
                />
            </>
        )
    }

    if(props.type === 'accept'){
        return (
            <>
                <Accept />
            </>
        )
    }

    if(props.type === 'disconnect'){
        return (
            <Disconnect />
        )
    }

    return null;
}