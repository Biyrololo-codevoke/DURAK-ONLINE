import {CARD_COVER} from "constants/GameImages";
import {CSSProperties, useEffect} from "react";

type Props = {
    cards_count: number;
    delta?: number;
    index: number
}

const MAX_ROTATE = 40;

function calculateCardStyles(index: number, length: number, image?: boolean) : CSSProperties {

    const shift = index / length * MAX_ROTATE - MAX_ROTATE/2;

    if(image){
        return {
            top: `${-shift*4}px`,
        }
    }

    return {
        rotate: `${-shift}deg`,
    }
}

export default function EnemyCards(props: Props) {

    const {index} = props;

    const delta = Math.floor((props.delta || -1) / 10);

    useEffect(
        ()=>{
            const el : HTMLDivElement = document.querySelectorAll('.enemy-cards')[index] as HTMLDivElement;
            if(!el) return
            const rect = el.getBoundingClientRect();

            el.style.setProperty('--box-x', `${rect.x}px`);
            el.style.setProperty('--box-y', `${rect.y}px`);
        },
        []
    )

    return (
        <div className="enemy-cards">
            {
                Array.from({length: props.cards_count}).map((card, index) => {
                    let className = '';
                    let delay = -1;
                    let offset = '';
                    if(delta && delta > 0){
                        if(index >= props.cards_count - 1 - delta){
                            className = 'new_card';
                            if(index >= props.cards_count / 2){
                                offset = `${-(index / (props.cards_count) - 0.5) * 80}px`
                            }
                            else{
                                offset = `${(0.5 - index / (props.cards_count)) * 80}px`
                            }
                        }
                        delay = props.cards_count - 1 - delta - index;
                    }

                    return (
                        <div className="enemy-card" key={`${index}-${props.delta || -1}`}
                        style={
                            {
                                ...calculateCardStyles(index, props.cards_count),
                            }
                        }
                        >
                            <img src={CARD_COVER} alt="card-cover" 
                            onDragStart={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            className={className}
                            style={
                                className ? {
                                    animationDelay: `${-delay*0.3}s`,
                                    '--offset': offset,
                                    opacity: 0
                                } as CSSProperties: 
                                {
                                    opacity: 1
                                }
                            }
                            />
                        </div>
                    )
                })
            }
        </div>
    )
}