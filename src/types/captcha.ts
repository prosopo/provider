export type Captcha = {
    captchaId: string,
    salt: string,
    format: SelectAllImg | SelectAllTxt
}

export type SelectAllImg = {
    solution: string[]
    images: Image[],
    target: string
}

export type SelectAllTxt = {
    solution: string | undefined
    text: string[],

}

export type Image = {
    path: string
}