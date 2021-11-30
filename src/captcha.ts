import {Captcha} from "./types/captcha";

const {blake2AsHex} = require('@polkadot/util-crypto');

function hash(data: string): string {
    return blake2AsHex(data);
}

export function hashDataSet(captchas: Captcha[]): string {
    // each captcha is a leaf in a very wide merkle tree
    const hashes = captchas.map(captcha => hash(captcha['id'] + captcha['solution'] + captcha['salt']));
    return hash(hashes.join())
}