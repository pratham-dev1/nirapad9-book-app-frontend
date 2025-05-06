import { SubscriptionTypes } from "./Enums"
export const getThemesInSettings = (subscription: number) => {
    const theme1 = { name: 'thm-blue', box: 'thm-box1' }
    const theme2 = { name: 'thm-light', box: 'thm-box2' }
    const theme3 = { name: 'thm-orange', box: 'thm-box3' }
    const theme4 = { name: 'thm-green', box: 'thm-box4' }
    if (subscription === SubscriptionTypes.BASIC) {
        return [theme1, theme2]
    }
    else {
        return [theme1, theme2, theme3, theme4]
    }
}

export const getThemesInHeader = (subscription: number) => {
    const theme1 = { name: 'thm-blue', imgSrc: '/blue-opt.png', alt: 'Blue Theme'}
    const theme2 = { name: 'thm-light', imgSrc: '/light-opt.png', alt: 'Light Theme' }
    const theme3 = { name: 'thm-orange', imgSrc: '/orange-opt.png', alt: 'Orange Theme' }
    const theme4 = { name: 'thm-green', imgSrc: '/green-opt.png', alt: 'Green Theme' }
    if (subscription === SubscriptionTypes.BASIC) {
        return []
    }
    else {
        return [theme1, theme2, theme3, theme4]
    }
}