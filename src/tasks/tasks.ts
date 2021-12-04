//Tasks that are shared by the API and CLI. Tasks will be database only, blockchain only, and a mixture
import {loadJSONFile} from "../util";
import {addHashesToDataset, hashDataset, parseCaptchaDataset} from "../captcha";
import {u8aToHex} from "@polkadot/util";
import {contractApiInterface} from "../types/contract";
import {prosopoContractApi} from "../contract";
import {Database} from "../types";
import {Captcha} from "../types/captcha";
import {ERRORS} from "../errors";

export class Tasks {

    contractApi: contractApiInterface
    db: Database

    constructor(env) {
        this.contractApi = new prosopoContractApi(env);
        this.db = env.db
    }

    // Contract tasks

    // TODO These functions could all be constructed automatically from the contract ABI
    async providerRegister(serviceOrigin: string, fee: number, payee: string, address: string): Promise<Object> {
        return await this.contractApi.contractTx('providerRegister', [serviceOrigin, fee, payee, address]);
    }

    async providerUpdate(serviceOrigin: string, fee: number, payee: string, address: string): Promise<Object> {
        return await this.contractApi.contractTx('providerUpdate', [serviceOrigin, fee, payee, address]);
    }

    async providerDeregister(address: string): Promise<Object> {
        return await this.contractApi.contractTx('providerDeregister', [address]);
    }

    async providerStake(value: number): Promise<Object> {
        return await this.contractApi.contractTx('providerStake', [], value);
    }

    async providerUnstake(value: number): Promise<Object> {
        return await this.contractApi.contractTx('providerUnstake', [], value);
    }

    async providerAddDataset(file: string): Promise<Object> {
        let dataset = parseCaptchaDataset(loadJSONFile(file));
        let datasetWithHashes = await addHashesToDataset(dataset);
        const datasetHash = hashDataset(datasetWithHashes);
        dataset['datasetId'] = u8aToHex(datasetHash);
        await this.db?.loadDataset(dataset);
        return await this.contractApi.contractTx('providerAddDataset', [datasetHash])
    }

    async dappRegister(dappServiceOrigin: string, dappContractAddress: string, dappOwner?: string | undefined): Promise<Object> {
        return await this.contractApi.contractTx('dappRegister', [dappServiceOrigin, dappContractAddress, dappOwner]);
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

    // Other tasks

    async getSolvedAndUnsolvedCaptcha(datasetId): Promise<Captcha[]> {
        console.log(`Dataset: ${datasetId}`);
        const unsolved = await this.db.getCaptcha(false, datasetId);
        const solved = await this.db.getCaptcha(true, datasetId);

        console.log(unsolved, solved);
        if (solved && unsolved) {
            delete solved.solution;
            return [solved, unsolved];
        } else {
            throw Error(ERRORS.DATABASE.CAPTCHA_GET_FAILED.message);
        }
    }


}

// async getProviderAccounts() {
//     return await this.contractApi.getStorage("")
// }