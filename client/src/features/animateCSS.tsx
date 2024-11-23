import { CSSProperties } from "react"

type Properties = {
    [key: string]: number | string
}
type Props = {
    element: HTMLElement,
    from?: Properties,
    to: Properties,
    duration: string
}

function getSuffix(property: string){
    switch(property){
        case 'rotate':
            return 'deg';
        case 'left':
        case 'top':
        case 'right':
        case 'bottom':
            return 'px';
        default:
            return '';
    }
    
}

function calcTime(time: string): number {
    let value = parseFloat(time);
    if(time.slice(-2) === 'ms') {
        return value;
    }

    if(time.slice(-1) === 's') {
        value *= 1000;
    }
    return value;
}

function animateCss(props: Props) {

    const timing_params : string[] = props.duration.split(' ');

    const {element} = props;

    const start : Properties = props.from || {};
    const computedStyle = window.getComputedStyle(element);
    const prev_transition = computedStyle.getPropertyValue('transition-timing-function');
    element.style.transitionTimingFunction = timing_params[1] || prev_transition;
    for (let key in props.to) {
        if(start[key] === undefined)
            start[key] = computedStyle.getPropertyValue(key);
    }

    const duration = calcTime(timing_params[0]);
    const end = props.to;
    let progress = 0;
    let prev_performance = performance.now();
        
    function animate () {
        if (progress >= duration) {
            return true;
        }
        requestAnimationFrame(animate);
        let now = performance.now();
        let time = now - prev_performance;
        prev_performance = now;

        progress += time;

        progress = Math.min(progress, duration);

        for (let key in end) {
            let startValue = parseFloat(start[key].toString());
            let endValue = parseFloat(end[key].toString());
            let animationValue = startValue + (endValue - startValue) * (progress / duration);
            element.style.setProperty(key, `${animationValue}${getSuffix(key)}`, 'important');
        }
    }

    animate();

    element.style.transitionTimingFunction = prev_transition;
}

export default animateCss;