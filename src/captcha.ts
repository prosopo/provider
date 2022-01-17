import {
    Captcha,
    Dataset,
    DatasetSchema,
    CaptchasSchema,
    CaptchasSolvedSchema,
    CaptchaWithIdAndSolution
} from "./types/captcha";
import {ERRORS} from './errors'
import {CaptchaMerkleTree} from "./merkle";

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

export function parseSolvedCaptchas(captchaJSON: JSON): CaptchaWithIdAndSolution[] {
    try {
        return CaptchasSolvedSchema.parse(captchaJSON)
    } catch (err) {
        throw(`${ERRORS.CAPTCHA.PARSE_ERROR.message}:\n${err}`);
    }
}

export function compareCaptchaSolutions(received: CaptchaWithIdAndSolution[], stored: Captcha[]) {
    if (received.length && stored.length) {
        let arr1Sorted = received.sort((a, b) => a.captchaId > b.captchaId ? 1 : -1);
        let arr2Sorted = stored.sort((a, b) => a.captchaId! > b.captchaId! ? 1 : -1);
        let successArr = arr1Sorted.map((captcha, idx) => compareCaptcha(captcha, arr2Sorted[idx]));
        return successArr.every(val => val)
    }
}

export function compareCaptcha(received, stored) {
    // this is a captcha we know the solution for
    if (stored.solution.length > 0) {
        return received.solution === stored.solution
        // we don't know the solution so just assume it's correct
    } else {
        return true
    }
}