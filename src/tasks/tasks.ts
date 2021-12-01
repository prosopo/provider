//Tasks that are shared by the API and CLI. Tasks will be database only, blockchain only, and a mixture

import {Environment} from "../env";
import {loadJSONFile} from "../util";
import {hashDataset, parseCaptchaDataset} from "../captcha";
import {u8aToHex} from "@polkadot/util";

let contractApi

export async function providerRegister(serviceOrigin: string, fee: number, payee: string, address: string) {
    return await contractApi.providerRegister(serviceOrigin, fee, payee, address);
}

export async function providerUpdate(serviceOrigin: string, fee: number, payee: string, address: string) {
    return await contractApi.providerUpdate(serviceOrigin, fee, payee, address);
}

export async function providerDeregister(address: string) {
    return await contractApi.providerDeregister(address);
}

export async function providerStake(value: number) {
    return await contractApi.providerStake(value);
}

export async function providerUnstake(value: number) {
    return await contractApi.providerUnstake(value);
}

export async function providerAddDataset(env: Environment, contractApi, file: string): Promise<Object> {
    let dataset = parseCaptchaDataset(loadJSONFile(file));
    let datasetHash = hashDataset(dataset['captchas']);
    await env.db?.loadDataset(dataset, u8aToHex(datasetHash));
    return await contractApi.providerAddDataset(datasetHash)
}

export async function dappRegister(dappServiceOrigin: string, dappContractAddress: string, dappOwner?: string | undefined) {
    return await contractApi.dappRegister(dappServiceOrigin, dappContractAddress, dappOwner);
}