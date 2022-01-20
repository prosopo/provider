import {
    Captcha,
    Dataset,
    DatasetSchema,
    CaptchasSchema,
    CaptchaSolutionSchema,
    CaptchaSolution
} from "./types/captcha";
import {ERRORS} from './errors'
import {CaptchaMerkleTree} from "./merkle";
import {hexHash, imageHash, readFile} from "./util";

export function addHashesToDataset(dataset: Dataset, tree: CaptchaMerkleTree): Dataset {
    try {
        dataset['captchas'] = dataset['captchas'].map((captcha, index) => (
            {captchaId: tree.leaves[index].hash, ...captcha}
        ))
        return dataset
    } catch (err) {
        throw(`${ERRORS.DATASET.HASH_ERROR.message}:\n${err}`);
    }

}

export function parseCaptchaDataset(datasetJSON: JSON): Dataset {
    try {
        return DatasetSchema.parse(datasetJSON)
    } catch (err) {
        throw(`${ERRORS.DATASET.PARSE_ERROR.message}:\n${err}`);
    }
}


export function parseCaptchas(captchaJSON: JSON): Captcha[] {
    try {
        return CaptchasSchema.parse(captchaJSON)
    } catch (err) {
        throw(`${ERRORS.CAPTCHA.PARSE_ERROR.message}:\n${err}`);
    }
}

export function parseCaptchaSolutions(captchaJSON: JSON): CaptchaSolution[] {
    try {
        return CaptchaSolutionSchema.parse(captchaJSON)
    } catch (err) {
        throw(`${ERRORS.CAPTCHA.PARSE_ERROR.message}:\n${err}`);
    }
}

export function compareCaptchaSolutions(received: CaptchaSolution[], stored: Captcha[]): boolean {
    if (received.length && stored.length && received.length === stored.length) {
        let arr1Sorted = received.sort((a, b) => a.captchaId > b.captchaId ? 1 : -1);
        let arr2Sorted = stored.sort((a, b) => a.captchaId! > b.captchaId! ? 1 : -1);
        let successArr = arr1Sorted.map((captcha, idx) => compareCaptcha(captcha, arr2Sorted[idx]));
        return successArr.every(val => val)
    } else {
        return false
    }
}

export function compareCaptcha(received: CaptchaSolution, stored: Captcha): boolean {
    if (stored.solution && stored.solution.length > 0) {
        // this is a captcha we know the solution for
        let arr1 = received.solution.sort();
        let arr2 = stored.solution.sort();
        return arr1.every((value, index) => value === arr2[index]) && received.captchaId === stored.captchaId;
    } else {
        // we don't know the solution so just assume it's correct
        return true
    }
}

export async function computeCaptchaHash(captcha: Captcha) {
    let itemHashes: string[] = [];
    for (let item of captcha['items']) {
        if (item['type'] === 'image') {
            itemHashes.push(await imageHash(item['path']))
        } else if (item['type'] === 'text') {
            itemHashes.push(hexHash(item['text']));
        } else {
            throw(new Error('NotImplemented: only image and text item types allowed'))
        }
    }
    return hexHash([captcha['target'], captcha['solution'], captcha['salt'], itemHashes].join())
}

export function computeCaptchaSolutionHash(captcha: CaptchaSolution) {
    return hexHash([captcha['captchaId'], captcha['solution'], captcha['salt']].join())
}

export async function computeCaptchaHashes(captchas: Captcha[]): Promise<CaptchaSolution[]> {
    let captchasWithHashes: CaptchaSolution[] = []
    for (let captcha of captchas) {
        let captchaId = await computeCaptchaHash(captcha)
        let captchaSol = convertCaptchaToCaptchaSolution(captcha, captchaId);
        captchasWithHashes.push(captchaSol);
    }
    return captchasWithHashes
}


export function convertCaptchaToCaptchaSolution(captcha: Captcha, captchaId): CaptchaSolution {
    return {captchaId: captchaId, salt: captcha.salt, solution: captcha.solution}
}

