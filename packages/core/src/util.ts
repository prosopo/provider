// Copyright (C) 2021-2022 Prosopo (UK) Ltd.
// This file is part of provider <https://github.com/prosopo-io/provider>.
//
// provider is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// provider is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with provider.  If not, see <http://www.gnu.org/licenses/>.
import { ERRORS } from './errors'
const { decodeAddress, encodeAddress } = require('@polkadot/keyring')
const { hexToU8a, isHex } = require('@polkadot/util')
const { blake2AsHex } = require('@polkadot/util-crypto')
const fs = require('fs')

export function encodeStringAddress (address: string) {
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

export function shuffleArray<T> (array: T[]): T[] {
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

type PromiseQueueRes<T> = {
    data?: T;
    error?: Error;
}[];

/**
 * Executes promises in order
 * @param array - array of promises
 * @returns PromiseQueueRes\<T\>
 */
export async function promiseQueue<T> (
    array: (() => Promise<T>)[]
): Promise<PromiseQueueRes<T>> {
    const ret: PromiseQueueRes<T> = []

    await [...array, () => Promise.resolve(undefined)].reduce((promise, curr, i) => {
        return promise
            .then((res) => {
                // first iteration has no res (initial reduce result)
                if (res) {
                    ret.push({ data: res })
                }
                return curr()
            })
            .catch((err) => {
                ret.push({ data: err })
                return curr()
            })
    }, Promise.resolve<T | undefined>(undefined))

    return ret
}

export function parseBlockNumber(blockNumberString: string) {
    return parseInt(blockNumberString.replace(/,/g, ''))
}