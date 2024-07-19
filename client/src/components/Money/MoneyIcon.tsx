import { CSSProperties } from "react";

type Props = {
    size?: 'small' | 'medium' | 'large' | 'tiny';
    className?: string;
    style?: CSSProperties
}

export default function Money(props: Props) {
    return (
        <img src="/static/currency.png" alt="currency" className={`currency currency-${props.size} ${props.className}`}
        style={props.style}
        />
    )
}