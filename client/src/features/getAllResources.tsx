export default function getAllResources() : string[] {
    const SRCS = ['card_cover.png', 'chervi.png', 'currency.png', 'empty_user_photo.jpg',
        'logo512.png', 'ruby.png', 'serdce.png', 'tref.png'
    ]    
    const RESULT : string[] = [];

    const _pref = "/static/";

    for(let src of SRCS){
        RESULT.push(`${_pref}${src}`)
    }

    for(let i = 1; i <= 4; ++i){
        for(let j = 1; j <= 13; ++j){
            RESULT.push(
                `${_pref}cards/${i}_${j}.png`
            )
        }
    }

    return RESULT;
}