import Accept from "./Accept";
import TextMessage from "./TextMessage";

type Props = {
    type: 'text';
    message: string;
    color: 'white' | 'yellow'
} | {
    type: 'accept'
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

    return null;
}