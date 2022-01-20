import {Tasks} from '../../src/tasks/tasks'
import {MockEnvironment} from "../mocks/mockenv";
import {CaptchaMerkleTree} from "../../src/merkle";
import {PROVIDER, DAPP_USER, DAPP} from "../mocks/accounts"
import {ERRORS} from "../../src/errors";
import {SOLVED_CAPTCHAS, DATASET} from "../mocks/mockdb"
import {CaptchaSolution} from "../../src/types/captcha";
import {computeCaptchaSolutionHash} from "../../src/captcha";
import {sendFunds, setupDapp, setupProvider} from "../mocks/setup"

const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.should()
chai.use(chaiAsPromised);
const expect = chai.expect;


describe("PROVIDER TASKS", () => {
    before(async () => {
        const mockEnv = new MockEnvironment()
        await mockEnv.isReady();
        await setupDapp(mockEnv, DAPP);
    })

    after(() => {
        return
    });

    async function setup() {
        const mockEnv = new MockEnvironment()
        await mockEnv.isReady();
        await mockEnv.changeSigner(DAPP_USER.mnemonic);
        let captchaSolutions: CaptchaSolution[] = SOLVED_CAPTCHAS.map(captcha => ({
            captchaId: captcha.captchaId,
            solution: captcha.solution,
            salt: "usersalt"
        }))
        let tasks = new Tasks(mockEnv);
        return {mockEnv, tasks, captchaSolutions}
    }

    async function providerSetup(mockEnv) {
        const [providerMnemonic, providerSigner] = await mockEnv.createAccountAndAddToKeyring();
        await mockEnv.changeSigner("//Alice");
        await sendFunds(mockEnv, providerSigner.address, "Provider", "10000000000000000000")
        let provider = {...PROVIDER};
        provider.mnemonic = providerMnemonic;
        provider.address = providerSigner.address;
        const datasetId = await setupProvider(mockEnv, providerSigner.address, provider)
        return {datasetId, provider}
    }

    it("Captchas are correctly formatted before being passed to the API layer", async () => {
        const {tasks} = await setup();
        // @ts-ignore
        const datasetId = DATASET.datasetId;
        const captchas = await tasks.getCaptchaWithProof(datasetId, true, 1);
        expect(captchas[0]).to.deep.equal({
            "captcha": {
                "captchaId": "0x73f15c36e0600922aed7d0ea1f4580c188c087e5d8be5470a4ca8382c792e6b9",
                "datasetId": "0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605",
                "index": 0,
                "items": [{
                    "path": "/home/user/dev/prosopo/data/img/01.01.jpeg",
                    "type": "image"
                }, {
                    "path": "/home/user/dev/prosopo/data/img/01.02.jpeg",
                    "type": "image"
                }, {
                    "path": "/home/user/dev/prosopo/data/img/01.03.jpeg",
                    "type": "image"
                }, {
                    "path": "/home/user/dev/prosopo/data/img/01.04.jpeg",
                    "type": "image"
                }, {
                    "path": "/home/user/dev/prosopo/data/img/01.05.jpeg",
                    "type": "image"
                }, {
                    "path": "/home/user/dev/prosopo/data/img/01.06.jpeg",
                    "type": "image"
                }, {
                    "path": "/home/user/dev/prosopo/data/img/01.07.jpeg",
                    "type": "image"
                }, {
                    "path": "/home/user/dev/prosopo/data/img/01.08.jpeg",
                    "type": "image"
                }, {
                    "path": "/home/user/dev/prosopo/data/img/01.09.jpeg",
                    "type": "image"
                }],
                "salt": "0x01",
                "target": "bus"
            },
            "proof": [
                ["0x73f15c36e0600922aed7d0ea1f4580c188c087e5d8be5470a4ca8382c792e6b9", "0x894d733d37d2df738deba781cf6d5b66bd5b2ef1041977bf27908604e7b3e604"],
                ["0x40ccd7d86bb18860c660a211496e525a3cacc4b506440e56ac85ac824a253378", "0x76cb07140a3c9e1108e392386b286d60dd5e302dc59dfa8c049045107f8db854"],
                ["0x8b12abef36bfa970211495a826922d99f8a01a66f2e633fff4874061f637d814", "0xe52b9fc3595ec17f3ad8d7a8095e1b730c9c4f6be21f16a5d5c9ced6b1ef8903"],
                ["0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605"]
            ]
        });
    });

    it.only("Captcha proofs are returned if commitment found and solution is correct", async () => {
        const {mockEnv, tasks, captchaSolutions} = await setup();
        const {datasetId, provider} = await providerSetup(mockEnv);

        let tree = new CaptchaMerkleTree();
        let captchasHashed = captchaSolutions.map(captcha => computeCaptchaSolutionHash(captcha))
        tree.build(captchasHashed);
        let commitmentId = tree.root!.hash;
        await tasks.dappUserCommit(DAPP.contractAccount!, datasetId, commitmentId, provider.address);
        // next part contains contract calls that must be run by provider
        await mockEnv.changeSigner(provider.mnemonic);
        console.log("commitmentId", commitmentId);
        // TODO need to mock contract to get this to work, otherwise commitment has been Approved already and response
        //   is expected to be in the database but it's not as the database is mocked
        let result = await tasks.dappUserSolution(mockEnv.signer?.address!, DAPP.contractAccount!, JSON.parse(JSON.stringify(captchaSolutions)));
        console.log(JSON.stringify(result));
        expect(result.length).to.be.eq(2);
        let expected_proof = tree.proof(captchaSolutions[0].captchaId);
        expect(result[0].proof).to.deep.eq(expected_proof);
        expect(result[0].captchaId).to.eq(captchaSolutions[0].captchaId);
    });

    it("Dapp User sending an invalid captchas causes error", async () => {
        const {mockEnv, tasks} = await setup()
        let captchaSolutions = [{captchaId: "blah", solution: [21], salt: "blah"}]
        let tree = new CaptchaMerkleTree();
        let captchasHashed = captchaSolutions.map(captcha => computeCaptchaSolutionHash(captcha))
        tree.build(captchasHashed);
        let solutionPromise = tasks.dappUserSolution(mockEnv.signer?.address!, DAPP.contractAccount!, JSON.parse(JSON.stringify(captchaSolutions)));
        solutionPromise.catch(e => e.message.should.match(`/${ERRORS.CAPTCHA.INVALID_CAPTCHA_ID.message}/`));
    });

    it("Dapp User sending solutions without committing to blockchain causes error", async () => {
        const {mockEnv, tasks, captchaSolutions} = await setup();
        let tree = new CaptchaMerkleTree();
        let captchasHashed = captchaSolutions.map(captcha => computeCaptchaSolutionHash(captcha))
        tree.build(captchasHashed);
        let solutionPromise = tasks.dappUserSolution(mockEnv.signer?.address!, DAPP.contractAccount!, JSON.parse(JSON.stringify(captchaSolutions)));
        solutionPromise.catch(e => e.message.should.match(`/${ERRORS.CONTRACT.CAPTCHA_SOLUTION_COMMITMENT_DOES_NOT_EXIST.message}/`));
    })

    it("No proofs are returned if commitment found and solution is incorrect", async () => {
        const {mockEnv, tasks, captchaSolutions} = await setup()
        const captchaSolutionsBad = captchaSolutions.map(original => ({...original, solution: [3]}));
        let tree = new CaptchaMerkleTree();
        let captchasHashed = captchaSolutionsBad.map(captcha => computeCaptchaSolutionHash(captcha))
        tree.build(captchasHashed);
        let commitmentId = tree.root!.hash;
        const provider = await tasks.getProviderDetails(process.env.PROVIDER_ADDRESS!);
        await tasks.dappUserCommit(DAPP.contractAccount!, provider.captcha_dataset_id, commitmentId, process.env.PROVIDER_ADDRESS!);
        // next part contains contract calls that must be run by provider
        await mockEnv.changeSigner(process.env.PROVIDER_MNEMONIC!);
        console.log("commitmentId", commitmentId);
        let result = await tasks.dappUserSolution(mockEnv.signer?.address!, DAPP.contractAccount!, JSON.parse(JSON.stringify(captchaSolutionsBad)));
        expect(result.length).to.be.eq(0);

    })
});