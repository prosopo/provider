import {Captcha, Dataset, DatasetSchema} from "./types/captcha";
import {ERRORS} from './errors'
import path from "path";
import {readFile} from "./util";

const {u8aConcat} = require('@polkadot/util');
const {blake2AsU8a, blake2AsHex} = require('@polkadot/util-crypto');

function hash(data: string | Uint8Array): Uint8Array {

    return blake2AsU8a(data);
}

function hexHash(data: string | Uint8Array): string {
    return blake2AsHex(data);
}

export async function addHashesToCaptchas(captchas: Captcha[]): Promise<Captcha[]> {
    let itemHashes = '';
    for (let captcha of captchas) {
        for (let item of captcha['items']) {
            if (item['type'] === 'image') {
                const fileBuffer = await readFile(item['path']);
                itemHashes += hexHash(fileBuffer);
            } else if (item['type'] === 'text') {
                itemHashes += hexHash(item['text']);
            } else {
                throw('NotImplemented: only image and text item types allowed')
            }
        }
        //TODO what about target? Salt should avoid collisions but...
        captcha['captchaId'] = hexHash([captcha['solution'], captcha['salt'], itemHashes].join());
    }
    console.log(captchas);
    return captchas
}


export async function addHashesToDataset(dataset: Dataset): Promise<Dataset> {
    try {
        const datasetWithHashes = dataset;
        datasetWithHashes['captchas'] = await addHashesToCaptchas(dataset['captchas']);
        return datasetWithHashes
    } catch (err) {
        throw(`${ERRORS.DATASET.HASH_ERROR.message}:\n${err}`);
    }

}

export function hashDataset(dataset: Dataset) {
    return hash(dataset['captchas'].map(c => c['captchaId']).join())
}


export function parseCaptchaDataset(captchaJSON: JSON): Dataset {
    try {
        return DatasetSchema.parse(captchaJSON)
    } catch (err) {
        throw(`${ERRORS.DATASET.PARSE_ERROR.message}:\n${err}`);
    }
}

