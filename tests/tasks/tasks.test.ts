import {Tasks} from '../../src/tasks/tasks'
import {MockEnvironment} from "../mocks/mockenv";
import {convertCaptchaToCaptchaSolution} from "../../src/captcha";
import {CaptchaMerkleTree} from "../../src/merkle";
import {PROVIDER, DAPP_USER, DAPP} from "../mocks/accounts"
import {ERRORS} from "../../src/errors";

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
chai.use(chaiAsPromised);
const expect = chai.expect



describe("PROVIDER TASKS", () => {
    after(() => {
        return
    });

    async function setup() {
        const mockEnv = new MockEnvironment()
        await mockEnv.isReady();
        let tasks = new Tasks(mockEnv);
        return {mockEnv, tasks}
    }


    it("Captchas are correctly formatted before being passed to the API layer", async () => {
        const {tasks} = await setup()
        const datasetId = "0x0282715bd2de51935c8ed3bf101ad150861d91b2af0e6c50281740a0c072650a"
        //const datasetHash  = blake2AsHex(stringToU8a(datasetId), 256);
        const captchas = await tasks.getCaptchaWithProof(datasetId, true, 1);
        expect(captchas[0]).to.deep.equal(
            {
                "captcha": {
                    "captchaId": "0x9e7ef7b1093e1a9a74a6384a773d4e7ee25575d4fecc8a6fd7c9fe3357cbfad3",
                    "datasetId": "0x0282715bd2de51935c8ed3bf101ad150861d91b2af0e6c50281740a0c072650a",
                    "index": 0,
                    "items": [
                        {
                            "path": "/home/user/dev/prosopo/data/img/01.01.jpeg",
                            "type": "image"
                        },
                        {
                            "path": "/home/user/dev/prosopo/data/img/01.02.jpeg",
                            "type": "image"
                        },
                        {
                            "path": "/home/user/dev/prosopo/data/img/01.03.jpeg",
                            "type": "image"
                        },
                        {
                            "path": "/home/user/dev/prosopo/data/img/01.04.jpeg",
                            "type": "image"
                        },
                        {
                            "path": "/home/user/dev/prosopo/data/img/01.05.jpeg",
                            "type": "image"
                        },
                        {
                            "path": "/home/user/dev/prosopo/data/img/01.06.jpeg",
                            "type": "image"
                        },
                        {
                            "path": "/home/user/dev/prosopo/data/img/01.07.jpeg",
                            "type": "image"
                        },
                        {
                            "path": "/home/user/dev/prosopo/data/img/01.08.jpeg",
                            "type": "image"
                        },
                        {
                            "path": "/home/user/dev/prosopo/data/img/01.09.jpeg",
                            "type": "image"
                        }
                    ],
                    "salt": "0x01",
                    "target": "bus"
                },
                "proof": [
                    [
                        "0x9e7ef7b1093e1a9a74a6384a773d4e7ee25575d4fecc8a6fd7c9fe3357cbfad3",
                        "0x1b3336e2e69ca56f44e44cef13cc96e87972175a2d48068cb72327c73ca22268"
                    ],
                    [
                        "0xbda6440fa88b657669511c43c3a65785846e636e9d4f7a3dc06c2ce2450cc71a",
                        "0xaec652d7269399a55204e0c9a65e31292ddbf5d53e171529aac216cf1d582e3e"
                    ],
                    [
                        "0x8fa71c22d584c37c5229629ff2ef11719738979593fbb932c80043f80e146843",
                        "0xfcbb80f9cfd73111e50f0317813b4d4ae845d7ce3ecb10f5c5cce0e364b1380c"
                    ],
                    [
                        "0x0282715bd2de51935c8ed3bf101ad150861d91b2af0e6c50281740a0c072650a",
                    ]
                ]
            },
        )
    });
    it("Dapp User captcha solution is marked as correct if commitment found", async () => {
        const {mockEnv, tasks} = await setup()
        const datasetId = "0x0282715bd2de51935c8ed3bf101ad150861d91b2af0e6c50281740a0c072650a"
        const captchaProof = await tasks.getCaptchaWithProof(datasetId, true, 1);
        captchaProof[0].captcha.solution = [2, 3, 4];
        captchaProof[0].captcha.salt = "0xuser1";
        let tree = new CaptchaMerkleTree();
        let captchaSols = captchaProof.map(captchaProof => convertCaptchaToCaptchaSolution(captchaProof.captcha, captchaProof.captcha.captchaId));
        tree.build(captchaSols);
        let commitment_id = tree.root!.hash;
        await mockEnv.changeSigner(DAPP_USER.mnemonic);
        const provider = await tasks.getProviderDetails(process.env.PROVIDER_ADDRESS!);
        await tasks.dappUserCommit(DAPP.contractAccount!, provider.captcha_dataset_id, commitment_id, process.env.PROVIDER_ADDRESS!);
        let result = await tasks.dappUserSolution(mockEnv.signer?.address!, DAPP.contractAccount!, JSON.parse(JSON.stringify(captchaSols)));
        expect(result.length).to.be.eq(1);
        let expected_proof = tree.proof(captchaSols[0].captchaId);
        expect(result[0].proof).to.deep.eq(expected_proof);
        expect(result[0].captchaId).to.eq(captchaSols[0].captchaId);
    });
    it.only("Dapp User sending an invalid captchas causes error", async () => {
        const {mockEnv, tasks} = await setup()
        let captchaSols = [{
            solution: [999, 999, 999], // Solution that will never have been committed
            salt: "0xuser1",
            captchaId: "0x0000000000000000000000000000000000000000000000000000000000000001"
        }]
        let tree = new CaptchaMerkleTree();
        tree.build(captchaSols);
        await mockEnv.changeSigner(DAPP_USER.mnemonic);
        let solutionPromise = tasks.dappUserSolution(mockEnv.signer?.address!, DAPP.contractAccount!, JSON.parse(JSON.stringify(captchaSols)));
        return solutionPromise.should.throw("Invalid captcha id")
    });

    it.only("Dapp User sending duplicate data causes error", async () => {

    })

    it.only("Dapp User not committing to blockchain causes error", async () => {

    })
});