export default function MoneyShortName(money: number) : string {
    if(money < 1000) return `${money}`;

    if(money === 1000) return '1K'; 
    
    if(money < 10_000) {
        return `${(money / 1000).toFixed(1)}K`;
    }

    if(money < 1_000_000) {
        return `${(money / 1000).toFixed(0)}K`;
    }

    if(money === 1_000_000) {
        return '1M';
    }

    if(money < 10_000_000) {
        return `${(money / 1_000_000).toFixed(1)}M`;
    }

    return `${(money / 1_000_000).toFixed(0)}M`;
}