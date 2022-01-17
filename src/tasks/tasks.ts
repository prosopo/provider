//Tasks that are shared by the API and CLI. Tasks will be database only, blockchain only, and a mixture
import {loadJSONFile} from "../util";
import {addHashesToDataset, compareCaptchaSolutions, parseCaptchaDataset, parseSolvedCaptchas} from "../captcha";
import {hexToU8a} from "@polkadot/util";
import {contractApiInterface, Dapp, Provider} from "../types/contract";
import {prosopoContractApi} from "../contract";
import {Database} from "../types";
import {ERRORS} from "../errors";
import {CaptchaMerkleTree} from "../merkle";
import {CaptchaWithProof} from "../types/api";
import {GovernanceStatus} from "../types/provider";
import {buildDecodeVector} from "../codec/codec";
import {AnyJson} from "@polkadot/types/types/codec";
import {AccountId, Hash} from "@polkadot/types/interfaces";

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
        return await this.contractApi.contractCall('providerRegister', [serviceOrigin, fee, payee, address]);
    }

    async providerUpdate(serviceOrigin: string, fee: number, payee: string, address: string, value: number | undefined): Promise<Object> {
        return await this.contractApi.contractCall('providerUpdate', [serviceOrigin, fee, payee, address], value);
    }

    async providerDeregister(address: string): Promise<Object> {
        return await this.contractApi.contractCall('providerDeregister', [address]);
    }

    async providerUnstake(value: number): Promise<Object> {
        return await this.contractApi.contractCall('providerUnstake', [], value);
    }

    async providerAddDataset(file: string): Promise<Object> {
        let dataset = parseCaptchaDataset(loadJSONFile(file));
        let tree = new CaptchaMerkleTree();
        await tree.build(dataset['captchas']);
        let datasetHashes = addHashesToDataset(dataset, tree);
        datasetHashes['datasetId'] = tree.root?.hash;
        datasetHashes['tree'] = tree.layers;
        await this.db?.loadDataset(datasetHashes);
        console.log("Data set hash", tree.root?.hash);
        return await this.contractApi.contractCall('providerAddDataset', [hexToU8a(tree.root?.hash)])
    }

    async dappRegister(dappServiceOrigin: string, dappContractAddress: string, dappOwner?: string): Promise<Object> {
        return await this.contractApi.contractCall('dappRegister', [dappServiceOrigin, dappContractAddress, dappOwner]);
    }

    async dappFund(contractAccount: string, value: number) {
        return await this.contractApi.contractCall('dappFund', [contractAccount], value);
    }

    async dappCancel(contractAccount: string) {
        return await this.contractApi.contractCall('dappCancel', [contractAccount]);
    }

    async dappUserCommit(contractAccount: string, captchaDatasetId: Hash, userMerkleTreeRoot: string, providerAddress: string) {
        return await this.contractApi.contractCall('dappUserCommit', [contractAccount, captchaDatasetId, userMerkleTreeRoot, providerAddress]);
    }

    async providerApprove(captchaSolutionCommitmentId) {
        return await this.contractApi.contractCall('providerApprove', [captchaSolutionCommitmentId]);
    }

    async providerDisapprove(captchaSolutionCommitmentId) {
        return await this.contractApi.contractCall('providerDisapprove', [captchaSolutionCommitmentId]);
    }

    async dappOperatorIsHumanUser() {
    }

    async dappOperatorCheckRecentSolution() {
    }

    async addProsopoOperator() {
    }

    async captchaSolutionCommitment() {
    }

    async getProviderDetails(accountId: string): Promise<Provider> {
        return await this.contractApi.contractCall("getProviderDetails", [accountId])
    }

    async getDappDetails(accountId: string): Promise<Dapp> {
        return await this.contractApi.contractCall("getDappDetails", [accountId])
    }

    async getCaptchaData(captchaDatasetId: string) {
        return await this.contractApi.contractCall("getCaptchaData", [captchaDatasetId])
    }

    async getCaptchaSolutionCommitment(solutionId: string): Promise<Provider> {
        return await this.contractApi.contractCall("getCaptchaSolutionCommitment", [solutionId])
    }

    async providerAccounts(providerId: string, status: GovernanceStatus): Promise<AnyJson> {
        const providerAccountsList = await this.contractApi.getStorage("provider_accounts", buildDecodeVector('ProviderAccounts'));
        console.log(providerAccountsList);
        return providerAccountsList
    }

    async dappAccounts(dappId: string, status: GovernanceStatus): Promise<AnyJson> {
        const dappAccountsList = await this.contractApi.getStorage("dapp_accounts", buildDecodeVector('DappAccounts'));
        console.log(dappAccountsList);
        return dappAccountsList
    }

    // Other tasks

    /**
     * @description Get captchas that are solved or not solved, along with the merkle proof for each
     * @param {string}   datasetId  the id of the data set
     * @param {boolean}  solved    `true` when captcha is solved
     * @param {number}   size       the number of records to be returned
     */
    async getCaptchaWithProof(datasetId: Hash | string | Uint8Array, solved: boolean, size: number): Promise<CaptchaWithProof[]> {

        // TODO check that dataset is attached to a Provider before responding ???!!!
        //  Otherwise Providers could store any random data and have Dapp Users request it. Is there any advantage to
        //  this?

        const captchaDocs = await this.db.getRandomCaptcha(solved, datasetId, size);
        if (captchaDocs) {
            let captchas: CaptchaWithProof[] = [];
            for (let captcha of captchaDocs) {
                let captcha = captchaDocs[0];
                const datasetDetails = await this.db.getDatasetDetails(datasetId);
                const tree = new CaptchaMerkleTree();
                tree.layers = datasetDetails['tree'];
                let proof = tree.proof(captcha.captchaId!);
                // cannot pass solution to dapp user as they are required to solve the captcha!
                delete captcha.solution;
                captchas.push({captcha: captcha, proof: proof});
            }
            return captchas
        } else {
            throw Error(ERRORS.DATABASE.CAPTCHA_GET_FAILED.message);
        }
    }

    /**
     * Validate and store the clear text captcha solution(s) from the Dapp User
     * @param userAccount
     * @param dappAccount
     * @param {CaptchaWithProof} captchas
     * @return JSON result containing the contract event
     */
    async dappUserSolution(userAccount: AccountId, dappAccount: AccountId, captchas: JSON) {
        // Check captchas have valid structure solutions
        const receivedCaptchas = parseSolvedCaptchas(captchas);
        // Check captchas exist in DB
        const captchaIds = receivedCaptchas.map(captcha => [captcha.captchaId]);
        const storedCaptchas = await this.db.getCaptchaById(captchaIds);
        if (!storedCaptchas || receivedCaptchas.length !== storedCaptchas.length) {
            throw new Error(ERRORS.CAPTCHA.INVALID_CAPTCHA_ID.message)
        }
        let tree = new CaptchaMerkleTree();
        await tree.build(receivedCaptchas);
        await this.db.storeDappUserCaptchaSolution(receivedCaptchas, tree.root!.hash);
        let success = compareCaptchaSolutions(receivedCaptchas, storedCaptchas)
        if (success) {
            // TODO return captchas with merkle branches so that client can confirm that they belong to the dataset
        } else {
            // TODO return some kind of error message
        }
    }

    /**
     * Apply new captcha solutions to captcha dataset and recalculate merkle tree
     * @param {string} datasetId
     */
    async calculateCaptchaSolutions(datasetId: string) {
        //TODO run this on a predefined schedule as updating the dataset requires committing an updated
        // captcha_dataset_id to the blockchain
    }

}