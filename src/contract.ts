import {Environment} from './env'
import {ERRORS} from './errors'
import {encodeStringAddress} from './util'
import {Option, Text, Compact, u128} from '@polkadot/types';

const {blake2AsU8a} = require('@polkadot/util-crypto');

export class contractApiInterface {

    env: Environment

    constructor(env) {
        this.env = env;
    }

    // provider_register
    async providerRegister(providerServiceOrigin: string, providerFee: number, payee: string, address: string): Promise<Object> {
        await this.env.isReady();
        let encodedAddress = encodeStringAddress(address);
        const signedContract = this.env.contract!.connect(this.env.providerSigner!)
        let providerServiceOriginHash = blake2AsU8a(providerServiceOrigin);
        const response = await signedContract.tx.providerRegister(providerServiceOriginHash, providerFee, payee, encodedAddress);
        // @ts-ignore
        if (response.events) {
            return response.events.filter(x => x["name"] == "ProviderRegister")
        } else {
            throw(ERRORS.TRANSACTION.TX_ERROR); //TODO get the error information from response
        }
    }

    //provider_update
    async providerUpdate(providerServiceOrigin: string, providerFee: number, payee: string, address: string): Promise<Object> {
        await this.env.isReady();
        let encodedAddress = encodeStringAddress(address);
        const signedContract = this.env.contract!.connect(this.env.providerSigner!)
        let providerServiceOriginHash = blake2AsU8a(providerServiceOrigin);
        const response = await signedContract.tx.providerUpdate(providerServiceOriginHash, providerFee, payee, encodedAddress);
        // @ts-ignore
        if (response.events) {
            return response.events.filter(x => x["name"] == "ProviderUpdate")
        } else {
            throw(ERRORS.TRANSACTION.TX_ERROR); //TODO get the error information from response
        }
    }

    //provider_deregister
    async providerDeregister(address: string): Promise<Object> {
        await this.env.isReady();
        let encodedAddress = encodeStringAddress(address);
        const signedContract = this.env.contract!.connect(this.env.providerSigner!)
        const response = await signedContract.tx.providerDeregister(encodedAddress);
        // @ts-ignore
        console.log(response.events);
        if (response.events) {
            return response.events.filter(x => x["name"] == "ProviderDeregister")
        } else {
            throw(ERRORS.TRANSACTION.TX_ERROR); //TODO get the error information from response
        }
    }

    //provider_stake
    async providerStake(value: number): Promise<Object> {
        await this.env.isReady();
        const signedContract = this.env.contract!.connect(this.env.providerSigner!)
        const response = await signedContract.tx.providerStake({"value": value, "signer": this.env.providerSigner!})
        // @ts-ignore
        if (response.events) {
            return response.events.filter(x => x["name"] == "ProviderStake")
        } else {
            throw(ERRORS.TRANSACTION.TX_ERROR); //TODO get the error information from response
        }
    }

    //provider_unstake
    async providerUnstake(value: number): Promise<Object> {
        await this.env.isReady();
        const signedContract = this.env.contract!.connect(this.env.providerSigner!)
        const response = await signedContract.tx.providerUnstake({"value": value, "signer": this.env.providerSigner!})
        // @ts-ignore
        if (response.events) {
            return response.events.filter(x => x["name"] == "ProviderUnstake")
        } else {
            throw(ERRORS.TRANSACTION.TX_ERROR); //TODO get the error information from response
        }
    }

    //provider_add_data_set
    async providerAddDataset(datasetHash: Uint8Array): Promise<Object> {
        await this.env.isReady();
        const signedContract = this.env.contract!.connect(this.env.providerSigner!)
        const response = await signedContract.tx.providerAddDataset(datasetHash, {"signer": this.env.providerSigner})
        // @ts-ignore
        if (response.events) {
            return response.events.filter(x => x["name"] == "ProviderAddDataset")
        } else {
            throw(ERRORS.TRANSACTION.TX_ERROR); //TODO get the error information from response
        }
    }

    //dapp_register
    async dappRegister(dappServiceOrigin: string, dappContractAddress: string, dappOwner?: string | undefined): Promise<Object> {
        await this.env.isReady();
        const signedContract = this.env.contract!.connect(this.env.dappSigner!)
        const registry = this.env.network.api.registry;
        const response = await signedContract.tx.dappRegister(dappServiceOrigin, dappContractAddress, new Option(registry, Text, dappOwner))
        // @ts-ignore
        if (response.events) {
            return response.events.filter(x => (x["name"] == "DappRegister" || x["name"] == "DappUpdate"))
        } else {
            throw(ERRORS.TRANSACTION.TX_ERROR); //TODO get the error information from response
        }
    }

    //dapp_fund
    async dappFund() {
    }

    //dapp_cancel
    async dappCancel() {
    }

    //dapp_deregister
    async dappDeregister() {
    }

    //dapp_user_commit
    async dappUserCommit() {
    }

    //provider_approve
    async providerApprove() {
    }

    //provider_disapprove
    async providerDisapprove() {
    }

    //dapp_operator_is_human_user
    async dappOperatorIsHumanUser() {
    }

    //dapp_operator_check_recent_solution
    async dappOperatorCheckRecentSolution() {
    }

    //add_prosopo_operator
    async addProsopoOperator() {
    }

    //captcha_solution_commitment
    async captchaSolutionCommitment() {
    }
}