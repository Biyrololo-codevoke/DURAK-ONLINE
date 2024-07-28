import ActionButton from "./ActionButton";

export default function StartGame({start}: {start: ()=>void}){
    
    return (
        <ActionButton onClick={start}>
            Старт
        </ActionButton>
    )
}