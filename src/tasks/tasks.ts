//Tasks that are shared by the API and CLI. Tasks will be database only, blockchain only, and a mixture
import {loadJSONFile} from "../util";
import {addHashesToDataset, parseCaptchaDataset} from "../captcha";
import {hexToU8a} from "@polkadot/util";
import {contractApiInterface} from "../types/contract";
import {prosopoContractApi} from "../contract";
import {Database} from "../types";
import {Captcha} from "../types/captcha";
import {ERRORS} from "../errors";
import {CaptchaMerkleTree} from "../merkle";
import {CaptchaResponse, CaptchaWithProof} from "../types/api";

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
        let tree = new CaptchaMerkleTree();
        await tree.build(dataset['captchas']);
        let dataset_hashes = addHashesToDataset(dataset, tree);
        dataset_hashes['datasetId'] = tree.root?.hash;
        dataset_hashes['tree'] = tree.layers;
        console.log(dataset_hashes);
        await this.db?.loadDataset(dataset_hashes);
        return await this.contractApi.contractTx('providerAddDataset', [hexToU8a(tree.root?.hash)])
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

    async getSolvedAndUnsolvedCaptcha(datasetId): Promise<CaptchaWithProof[]> {
        const unsolved = await this.db.getCaptcha(false, datasetId, 1);
        const solved = await this.db.getCaptcha(true, datasetId, 1);

        if (solved && unsolved) {
            const datasetDetails = await this.db.getDatasetDetails(datasetId)
            const tree = new CaptchaMerkleTree();
            tree.layers = datasetDetails['tree'];
            let unsolved_proof = tree.proof(unsolved['captchaId'])
            let solved_proof = tree.proof(solved['captchaId'])

            // cannot pass solution to dapp user
            delete solved[0].solution;
            return [
                {'captcha': solved[0], 'proof': solved_proof},
                {'captcha': unsolved[0], 'proof': unsolved_proof}
            ];
        } else {
            throw Error(ERRORS.DATABASE.CAPTCHA_GET_FAILED.message);
        }
    }
}

// async getProviderAccounts() {
//     return await this.contractApi.getStorage("")
// }