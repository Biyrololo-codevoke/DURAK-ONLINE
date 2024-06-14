/**
 * Преобразовывает число в удобный для отображения формат
 * @param x число
 * @returns преобразованное число
 */
export default function numberWithSpaces(x: number | undefined) {
    if(x === undefined) return '0';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}