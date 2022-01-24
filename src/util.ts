import { ERRORS } from './errors'

const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const { hexToU8a, isHex } = require('@polkadot/util')
const { blake2AsHex } = require('@polkadot/util-crypto')
const fs = require('fs')

export function encodeStringAddress (address: string) {
    if (address.startsWith('0x')) {
        address = address.slice(2)
    }
    try {
        return encodeAddress(
            isHex(address)
                ? hexToU8a(address)
                : decodeAddress(address)
        )
    } catch (error) {
        throw new Error(`${ERRORS.CONTRACT.INVALID_ADDRESS.message}:${error}\n${address}`)
    }
}

export function loadJSONFile (filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath) as string)
    } catch (err) {
        throw new Error(`${ERRORS.GENERAL.JSON_LOAD_FAILED.message}:${err}`)
    }
}

export async function readFile (filePath): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) reject(err)
            resolve(data as Buffer)
        })
    })
}

export function shuffleArray (array) {
    for (let arrayIndex = array.length - 1; arrayIndex > 0; arrayIndex--) {
        const randIndex = Math.floor(Math.random() * (arrayIndex + 1));
        [array[arrayIndex], array[randIndex]] = [array[randIndex], array[arrayIndex]]
    }
    return array
}

export function hexHash (data: string | Uint8Array): string {
    return blake2AsHex(data)
}

export async function imageHash (path: string) {
    // data must remain in the same order so load images synchronously
    const fileBuffer = await readFile(path)
    return hexHash(fileBuffer)
}
