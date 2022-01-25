import path from 'path'
import { Tasks } from '../../src/tasks/tasks'
import { MockEnvironment } from '../mocks/mockenv'
import { CaptchaMerkleTree } from '../../src/merkle'
import {
    PROVIDER,
    DAPP_USER,
    DAPP,
    TestProvider,
    TestDapp
} from '../mocks/accounts'
import { ERRORS } from '../../src/errors'
import { SOLVED_CAPTCHAS, DATASET } from '../mocks/mockdb'
import { CaptchaSolution, Payee } from '../../src/types'
import {
    computeCaptchaSolutionHash,
    computePendingRequestHash
} from '../../src/captcha'
import { sendFunds, setupDapp, setupProvider } from '../mocks/setup'
import { randomAsHex } from '@polkadot/util-crypto'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.should()
chai.use(chaiAsPromised)
const expect = chai.expect

describe('PROVIDER TASKS', () => {
    let datasetId
    let provider: TestProvider
    let dapp
    const mockEnv = new MockEnvironment()

    before(async () => {
    // Register the dapp

        await mockEnv.isReady()
        // await setupDapp(mockEnv, DAPP)

        // Register a NEW provider otherwise commitments already exist in contract when Dapp User tries to use
        // dappUserCommit function
        const [providerMnemonic, providerAddress] =
      mockEnv.createAccountAndAddToKeyring()
        await mockEnv.changeSigner('//Alice')
        await sendFunds(
            mockEnv,
            providerAddress,
            'Provider',
            '10000000000000000000'
        )
        provider = { ...PROVIDER } as TestProvider
        provider.mnemonic = providerMnemonic
        provider.address = providerAddress
        datasetId = await setupProvider(
            mockEnv,
            providerAddress,
            provider
        )
        const [dappMnemonic, dappAddress] = mockEnv.createAccountAndAddToKeyring()
        dapp = { ...DAPP } as TestDapp
        await sendFunds(mockEnv, dappAddress, 'Dapp', '1000000000000000000')
        dapp.mnemonic = dappMnemonic
        dapp.address = dappAddress
        await setupDapp(mockEnv, dapp as TestDapp)
    })

    async function setup () {
        const mockEnv = new MockEnvironment()
        await mockEnv.isReady()
        await mockEnv.changeSigner(DAPP_USER.mnemonic)
        const captchaSolutions: CaptchaSolution[] = SOLVED_CAPTCHAS.map(
            (captcha) => ({
                captchaId: captcha.captchaId,
                solution: captcha.solution,
                salt: 'usersalt'
            })
        )
        const salt = randomAsHex()
        // console.log("Request Hash Salt:", salt);
        // // console.log("Dapp User AccountId:\t", mockEnv.signer!.address);
        // // console.log("CaptchaIds:\t", captchaSolutions.map(c => c.captchaId).sort());
        const requestHash = computePendingRequestHash(
            captchaSolutions.map((c) => c.captchaId),
      mockEnv.signer!.address,
      salt
        )
        await mockEnv.db!.storeDappUserPending(
      mockEnv.signer!.address,
      requestHash,
      salt
        )
        const tasks = new Tasks(mockEnv)
        return { mockEnv, tasks, captchaSolutions, requestHash }
    }

    it('Provider registeration', async () => {
        const { tasks } = await setup()
        try {
            const result = await tasks.providerRegister(
                provider.serviceOrigin,
                provider.fee,
                provider.payee,
                provider.address
            )
            // expect(result).to.deep.equal([]);
        } catch (error) {
            console.log(error)
            throw new Error('Error in regestering provider')
        }
    })

    it.only('Provider updation', async () => {
        const { tasks } = await setup()
        const [providerMnemonic, providerAddress] =
      mockEnv.createAccountAndAddToKeyring()
        provider = { ...PROVIDER } as TestProvider
        provider.mnemonic = providerMnemonic
        provider.address = providerAddress
        await mockEnv.changeSigner('//Alice')
        await sendFunds(
            mockEnv,
            providerAddress,
            'Provider',
            '10000000000000000000'
        )
        await setupProvider(
            mockEnv,
            providerAddress,
            provider
        )
        const value = 1
        await mockEnv.changeSigner(provider.mnemonic)
        const providerTasks = new Tasks(mockEnv)
        try {
            const result: any = await providerTasks.providerUpdate(
                provider.serviceOrigin,
                provider.fee,
                provider.payee,
                provider.address,
                value
            )
            expect(result[0].args[0]).to.equal(provider.address)
        } catch (error) {
            console.log(error)
            throw new Error('Error in updating provider')
        }
    })

    it('Provider deregister', async () => {
        const { tasks } = await setup()
        const address = process.env.PROVIDER_ADDRESS || ''
        try {
            const provider: any = await tasks.providerDeregister(address)
            expect(provider[0].args[0]).to.equal(address)
        } catch (error) {
            console.log(error)
            throw new Error('Error in deregestering provider')
        }
    })

    it('Provider unstake', async () => {
        const { tasks } = await setup()
        const [providerMnemonic, providerAddress] =
      mockEnv.createAccountAndAddToKeyring()
        const address = providerAddress
        const value = 1
        try {
            const provider: any = await tasks.providerUnstake(value)
            expect(provider[0].args[0]).to.equal(address)
        } catch (error) {
            console.log(error)
            throw new Error('Error in unstake provider')
        }
    })

    it('Provider add dataset', async () => {
        const { tasks } = await setup()
        const address = provider.address
        const value = 1
        try {
            const captchaFilePath = path.resolve(
                __dirname,
                '../mocks/data/captchas.json'
            )
            const provider: any = await tasks.providerAddDataset(captchaFilePath)
            console.log(provider)
            expect(provider[0].args[0]).to.equal(address)
        } catch (error) {
            console.log(error)
            throw new Error('Error in adding dataset')
        }
    })

    it('Captchas are correctly formatted before being passed to the API layer', async () => {
        const { tasks } = await setup()
        // @ts-ignore
        const datasetId = DATASET.datasetId
        const captchas = await tasks.getCaptchaWithProof(datasetId, true, 1)
        expect(captchas[0]).to.deep.equal({
            captcha: {
                captchaId:
          '0x73f15c36e0600922aed7d0ea1f4580c188c087e5d8be5470a4ca8382c792e6b9',
                datasetId:
          '0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605',
                index: 0,
                items: [
                    {
                        path: '/home/user/dev/prosopo/data/img/01.01.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.02.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.03.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.04.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.05.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.06.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.07.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.08.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.09.jpeg',
                        type: 'image'
                    }
                ],
                salt: '0x01',
                target: 'bus'
            },
            proof: [
                [
                    '0x73f15c36e0600922aed7d0ea1f4580c188c087e5d8be5470a4ca8382c792e6b9',
                    '0x894d733d37d2df738deba781cf6d5b66bd5b2ef1041977bf27908604e7b3e604'
                ],
                [
                    '0x40ccd7d86bb18860c660a211496e525a3cacc4b506440e56ac85ac824a253378',
                    '0x76cb07140a3c9e1108e392386b286d60dd5e302dc59dfa8c049045107f8db854'
                ],
                [
                    '0x8b12abef36bfa970211495a826922d99f8a01a66f2e633fff4874061f637d814',
                    '0xe52b9fc3595ec17f3ad8d7a8095e1b730c9c4f6be21f16a5d5c9ced6b1ef8903'
                ],
                ['0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605']
            ]
        })
    })

    it('Captcha proofs are returned if commitment found and solution is correct', async () => {
        const { mockEnv, tasks, captchaSolutions, requestHash } = await setup()
        // salt ensures captcha commitment is different each time
        // console.log("Request Hash: ", requestHash);
        const salt = randomAsHex()
        // console.log("User Captchas Salt: ", salt);
        const tree = new CaptchaMerkleTree()
        const captchaSolutionsSalted = captchaSolutions.map((captcha) => ({
            ...captcha,
            salt: salt
        }))
        const captchasHashed = captchaSolutionsSalted.map((captcha) =>
            computeCaptchaSolutionHash(captcha)
        )
        tree.build(captchasHashed)
        const commitmentId = tree.root!.hash
        // console.log("Sending Commitment to contract")
        // console.log("CommitmentId: ", commitmentId);
        await tasks.dappUserCommit(
            DAPP.contractAccount,
            datasetId,
            commitmentId,
            provider.address
        )
        const commitment = await tasks.getCaptchaSolutionCommitment(commitmentId)
        // console.log("Commitment:\n",commitment);

        // next part contains internal contract calls that must be run by provider
        await mockEnv.changeSigner(provider.mnemonic)
        const result = await tasks.dappUserSolution(
            DAPP_USER.address,
            DAPP.contractAccount,
            requestHash,
            JSON.parse(JSON.stringify(captchaSolutionsSalted))
        )
        // console.log(JSON.stringify(result));
        expect(result.length).to.be.eq(2)
        const expected_proof = tree.proof(captchaSolutionsSalted[0].captchaId)
        expect(result[0].proof).to.deep.eq(expected_proof)
        expect(result[0].captchaId).to.eq(captchaSolutionsSalted[0].captchaId)
    })

    it('Dapp User sending an invalid captchas causes error', async () => {
        const { mockEnv, tasks, requestHash } = await setup()
        const captchaSolutions = [
            { captchaId: 'blah', solution: [21], salt: 'blah' }
        ]
        const tree = new CaptchaMerkleTree()
        const captchasHashed = captchaSolutions.map((captcha) =>
            computeCaptchaSolutionHash(captcha)
        )
        tree.build(captchasHashed)
        const solutionPromise = tasks.dappUserSolution(
            DAPP_USER.address,
            DAPP.contractAccount,
            requestHash,
            JSON.parse(JSON.stringify(captchaSolutions))
        )
        solutionPromise.catch((e) =>
            e.message.should.match(`/${ERRORS.CAPTCHA.INVALID_CAPTCHA_ID.message}/`)
        )
    })

    it('Dapp User sending solutions without committing to blockchain causes error', async () => {
        const { mockEnv, tasks, captchaSolutions, requestHash } = await setup()
        const tree = new CaptchaMerkleTree()
        const captchasHashed = captchaSolutions.map((captcha) =>
            computeCaptchaSolutionHash(captcha)
        )
        tree.build(captchasHashed)
        const solutionPromise = tasks.dappUserSolution(
            DAPP_USER.address,
            DAPP.contractAccount,
            requestHash,
            JSON.parse(JSON.stringify(captchaSolutions))
        )
        solutionPromise.catch((e) =>
            e.message.should.match(
                `/${ERRORS.CONTRACT.CAPTCHA_SOLUTION_COMMITMENT_DOES_NOT_EXIST.message}/`
            )
        )
    })

    it('Captchas are correctly formatted before being passed to the API layer', async () => {
        const { tasks } = await setup()
        const datasetId = DATASET.datasetId
        const captchas = await tasks.getCaptchaWithProof(datasetId, true, 1)
        expect(captchas[0]).to.deep.equal({
            captcha: {
                captchaId:
          '0x73f15c36e0600922aed7d0ea1f4580c188c087e5d8be5470a4ca8382c792e6b9',
                datasetId:
          '0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605',
                index: 0,
                items: [
                    {
                        path: '/home/user/dev/prosopo/data/img/01.01.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.02.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.03.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.04.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.05.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.06.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.07.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.08.jpeg',
                        type: 'image'
                    },
                    {
                        path: '/home/user/dev/prosopo/data/img/01.09.jpeg',
                        type: 'image'
                    }
                ],
                salt: '0x01',
                target: 'bus'
            },
            proof: [
                [
                    '0x73f15c36e0600922aed7d0ea1f4580c188c087e5d8be5470a4ca8382c792e6b9',
                    '0x894d733d37d2df738deba781cf6d5b66bd5b2ef1041977bf27908604e7b3e604'
                ],
                [
                    '0x40ccd7d86bb18860c660a211496e525a3cacc4b506440e56ac85ac824a253378',
                    '0x76cb07140a3c9e1108e392386b286d60dd5e302dc59dfa8c049045107f8db854'
                ],
                [
                    '0x8b12abef36bfa970211495a826922d99f8a01a66f2e633fff4874061f637d814',
                    '0xe52b9fc3595ec17f3ad8d7a8095e1b730c9c4f6be21f16a5d5c9ced6b1ef8903'
                ],
                ['0x4e5b2ae257650340b493e94b4b4a4ac0e0dded8b1ecdad8252fe92bbd5b26605']
            ]
        })
    })

    it('Captcha proofs are returned if commitment found and solution is correct', async () => {
        const { mockEnv, tasks, captchaSolutions, requestHash } = await setup()
        // salt ensures captcha commitment is different each time
        // console.log("Request Hash: ", requestHash);
        const salt = randomAsHex()
        // console.log("User Captchas Salt: ", salt);
        const tree = new CaptchaMerkleTree()
        const captchaSolutionsSalted = captchaSolutions.map((captcha) => ({
            ...captcha,
            salt: salt
        }))
        const captchasHashed = captchaSolutionsSalted.map((captcha) =>
            computeCaptchaSolutionHash(captcha)
        )
        tree.build(captchasHashed)
        const commitmentId = tree.root!.hash
        // console.log("Sending Commitment to contract")
        // console.log("CommitmentId: ", commitmentId);
        await tasks.dappUserCommit(
      dapp.contractAccount as string,
      datasetId as string,
      commitmentId,
      provider.address
        )
        // const commitment = await tasks.getCaptchaSolutionCommitment(commitmentId)
        // console.log("Commitment:\n",commitment);

        // next part contains internal contract calls that must be run by provider
        await mockEnv.changeSigner(provider.mnemonic)
        const result = await tasks.dappUserSolution(
            DAPP_USER.address,
      dapp.contractAccount as string,
      requestHash,
      JSON.parse(JSON.stringify(captchaSolutionsSalted)) as JSON
        )
        // console.log(JSON.stringify(result));
        expect(result.length).to.be.eq(2)
        const expectedProof = tree.proof(captchaSolutionsSalted[0].captchaId)
        expect(result[0].proof).to.deep.eq(expectedProof)
        expect(result[0].captchaId).to.eq(captchaSolutionsSalted[0].captchaId)
    })

    it('Dapp User sending an invalid captchas causes error', async () => {
        const { tasks, requestHash } = await setup()
        const captchaSolutions = [
            { captchaId: 'blah', solution: [21], salt: 'blah' }
        ]
        const tree = new CaptchaMerkleTree()
        const captchasHashed = captchaSolutions.map((captcha) =>
            computeCaptchaSolutionHash(captcha)
        )
        tree.build(captchasHashed)
        const solutionPromise = tasks.dappUserSolution(
            DAPP_USER.address,
      dapp.contractAccount as string,
      requestHash,
      JSON.parse(JSON.stringify(captchaSolutions)) as JSON
        )
        solutionPromise.catch((e) =>
            e.message.should.match(`/${ERRORS.CAPTCHA.INVALID_CAPTCHA_ID.message}/`)
        )
    })

    it('Dapp User sending solutions without committing to blockchain causes error', async () => {
        const { tasks, captchaSolutions, requestHash } = await setup()
        const tree = new CaptchaMerkleTree()
        const captchasHashed = captchaSolutions.map((captcha) =>
            computeCaptchaSolutionHash(captcha)
        )
        tree.build(captchasHashed)
        const solutionPromise = tasks.dappUserSolution(
            DAPP_USER.address,
      dapp.contractAccount as string,
      requestHash,
      JSON.parse(JSON.stringify(captchaSolutions)) as JSON
        )
        solutionPromise.catch((e) =>
            e.message.should.match(
                `/${ERRORS.CONTRACT.CAPTCHA_SOLUTION_COMMITMENT_DOES_NOT_EXIST.message}/`
            )
        )
    })

    it.only('No proofs are returned if commitment found and solution is incorrect', async () => {
        const { mockEnv, tasks, captchaSolutions, requestHash } = await setup()
        const captchaSolutionsBad = captchaSolutions.map(original => ({ ...original, solution: [3] }))
        const tree = new CaptchaMerkleTree()
        const salt = randomAsHex()
        // Have to salt the solutions with random salt each time otherwise we end up with the same commitment for
        // multiple users
        const captchaSolutionsSalted = captchaSolutionsBad.map(captcha => ({ ...captcha, salt: salt }))
        const captchasHashed = captchaSolutionsBad.map(captcha => computeCaptchaSolutionHash(captcha))
        tree.build(captchasHashed)
        const commitmentId = tree.root!.hash
        await tasks.dappUserCommit(dapp.contractAccount as string, datasetId as string, commitmentId, provider.address)
        // next part contains internal contract calls that must be run by provider
        await mockEnv.changeSigner(provider.mnemonic)
        // console.log('commitmentId', commitmentId)
        const result = await tasks.dappUserSolution(DAPP_USER.address, dapp.contractAccount as string, requestHash, JSON.parse(JSON.stringify(captchaSolutionsSalted)) as JSON)
        expect(result.length).to.be.eq(0)
    })
})
