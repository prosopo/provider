import {Environment} from './env'
import {ERRORS} from './errors'
import {contractApiInterface} from "./types/contract";
import {isU8a} from '@polkadot/util';
import {Registry} from "redspot/types/provider";
import {AbiMessage} from "@polkadot/api-contract/types";
import Contract from "@redspot/patract/contract";
import {Codec} from "@polkadot/types/types";

const {blake2AsU8a} = require('@polkadot/util-crypto');

export class prosopoContractApi implements contractApiInterface {

    env: Environment

    constructor(env) {
        this.env = env;
    }

    /**
     * Perform a contract transaction calling the specified method
     * @param {string} contractMethodName
     * @param {Array}  args
     * @param {number} value    A value to send with the transaction, e.g. a stake
     * @return JSON result containing the contract event
     */
    async contractCall(contractMethodName: string, args: Array<any>, value?: number): Promise<any> {
        await this.env.isReady();
        const signedContract: Contract = this.env.contract!.connect(this.env.signer!)
        const methodObj = this.getContractMethod(contractMethodName)
        const encodedArgs = this.encodeArgs(methodObj, args);
        if (methodObj.isMutating) {
            return await this.contractTx(signedContract, contractMethodName, encodedArgs, value);
        } else {
            return await this.contractQuery(signedContract, contractMethodName, encodedArgs);
        }

    }

    async contractTx(signedContract: Contract, contractMethodName: string, encodedArgs: any[], value: number | undefined): Promise<any> {
        let response;
        if (value) {
            response = await signedContract.tx[contractMethodName](...encodedArgs, {value: value});
        } else {
            response = await signedContract.tx[contractMethodName](...encodedArgs);
        }
        const property = 'events';
        if (response.error) {
            throw(response.error.message);
        }
        if (response.result.isInBlock && response.result.isFinalized) {
            const eventName = this.getEventNameFromMethodName(contractMethodName);
            if (property in response) {
                // @ts-ignore
                return response[property].filter(x => x["name"] == eventName)
            } else {
                throw(ERRORS.CONTRACT.TX_ERROR.message);
            }
        }
    }

    /**
     * Perform a contract query (non-mutating) calling the specified method
     * @param {Contract} signedContract
     * @param {string} contractMethodName
     * @param {Array}  encodedArgs

     * @return JSON result containing the contract event
     */
    async contractQuery(signedContract: Contract, contractMethodName: string, encodedArgs: any[]): Promise<any> {
        const response = await signedContract.query[contractMethodName](...encodedArgs);
        if (response.result.isOk && response.output) {
            // @ts-ignore
            return this.unwrap(response.output.toJSON());
        } else {
            throw(response.result.asErr);
        }
    }

    unwrap(item: Codec) {
        const prop = "ok";
        if (prop in item) {
            return item[prop]
        }
        return item
    }

    /** Encodes arguments that should be hashes using blake2AsU8a

     * @return encoded arguments
     */
    encodeArgs(methodObj: object, args: any[], value?: number): any[] {
        let encodedArgs: any[] = [];
        // args must be in the same order as methodObj['args']
        methodObj['args'].forEach(function (methodArg, idx) {
            if (methodArg['type']['type'] === 'Hash' && !isU8a(args[idx])) {
                encodedArgs.push(blake2AsU8a(args[idx]));
            } else {
                encodedArgs.push(args[idx]);
            }
        });
        return encodedArgs
    }

    /** Get the contract method from the ABI
     * @return the contract method object
     */
    getContractMethod(contractMethodName: string): AbiMessage {
        const methodObj = this.env.contract?.abi.messages.filter(obj => obj['method'] === contractMethodName)[0];
        if (methodObj) {
            return methodObj
        } else {
            throw (ERRORS.CONTRACT.INVALID_METHOD.message);
        }
    }

    /** Get the storage key from the ABI given a storage name
     * @return the storage key
     */
    getStorageKey(storageName: string): string {
        // TODO there has got to be a better way to get this info
        // @ts-ignore
        const storageEntry = this.env.contract?.abi.json!['V1']['storage']['struct']['fields'].filter(obj => obj['name'] === storageName)[0];
        if (storageEntry) {
            return storageEntry["layout"]["cell"]["key"];
        } else {
            throw (ERRORS.CONTRACT.INVALID_STORAGE_NAME.message);
        }
    }

    /**
     * Get the event name from the contract method name
     * Each of the ink contract methods returns an event with a capitalised version of the method name
     * @return {string} event name
     */
    //TODO use the `method` and `identifier` in the contract fragment (see redspot patract contract.ts)
    // identifier: 'dapp_register',
    // index: 6,
    // method: 'dappRegister',

    getEventNameFromMethodName(contractMethodName: string): string {
        return contractMethodName[0].toUpperCase() + contractMethodName.substring(1);
    }


    /**
     * Get the data at specified storage key
     * @return {any} data
     */
    async getStorage<T>(name: string, decodingFn: (registry: Registry, data: Uint8Array) => T): Promise<T> {
        await this.env.isReady();
        const storageKey = this.getStorageKey(name);
        // const promiseresult = this.env.contract!.api.rpc.contracts.getStorage(this.env.contract!.address, storageKey);
        const promiseresult = await this.env.network.api.rpc.contracts.getStorage(this.env.contract!.address, storageKey);
        const data = promiseresult.unwrapOrDefault();
        // console.log(data.toHex());
        return decodingFn(this.env.network.registry, data);
        // console.log(this.hex_to_string(data.toHex()));
    }
}

