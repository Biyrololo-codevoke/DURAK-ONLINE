import {CARD_COVER} from "constants/GameImages";
import { CSSProperties } from "react";

type Props = {
    cards_count: number
}

const MAX_ROTATE = 40;

function calculateCardStyles(index: number, length: number) : CSSProperties {

    const shift = index / length * MAX_ROTATE - MAX_ROTATE/2;

    return {
        rotate: `${-shift - 90}deg`,
    }
}

export default function Bito({cards_count}: Props) {

    return (
        <div id="bito">
            {
                Array.from({length: cards_count}).map((_, index) => {
                    return (
                        <div className="bito__card" key={index}>
                            <img src={CARD_COVER} alt="card-cover" 
                            onDragStart={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            style={
                                calculateCardStyles(index, cards_count)
                            }
                            />
                        </div>
                    )
                })
            }
        </div>
        )
}