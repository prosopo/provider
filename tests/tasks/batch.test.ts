// Copyright 2021-2023 Prosopo (UK) Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { MockEnvironment } from '../mocks/mockenv'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { BatchCommitter } from '../../src/tasks/batch'
import { AccountKey, accountAddress, accountMnemonic } from '../dataUtils/DatabaseAccounts'
import { changeSigner, getUser } from '../mocks/accounts'
import { CaptchaSolution, hexHash } from '@prosopo/datasets'
import { ScheduledTaskNames } from '../../src/types/scheduler'

chai.should()
chai.use(chaiAsPromised)
const expect = chai.expect

describe('BATCH TESTS', () => {
    it('Batches commitments on-chain', async () => {
        const mnemonic = 'unaware pulp tuna oyster tortoise judge ordinary doll maid whisper cry cat'
        const env = new MockEnvironment(mnemonic)
        await env.isReady()
        const contractApi = await env.getContractApi()
        if (env.db) {
            const providerAccount = await getUser(env, AccountKey.providersWithStakeAndDataset)
            await env.changeSigner(accountMnemonic(providerAccount))

            // Batcher must be created with the provider account as the pair on the contractApi, otherwise the batcher
            // will fail with `ProviderDoesNotExist` error.
            const batcher = new BatchCommitter(env.config.batchCommit, await env.getContractApi(), env.db, env.logger)

            const providerTasks = await changeSigner(env, providerAccount)
            const providerDetails = await providerTasks.contractApi.getProviderDetails(accountAddress(providerAccount))
            const dappAccount = await getUser(env, AccountKey.dappsWithStake)
            const randomCaptchasResult = await providerTasks.db.getRandomCaptcha(false, providerDetails.datasetId)
            if (randomCaptchasResult) {
                const unsolvedCaptcha = randomCaptchasResult[0]
                const solution = [
                    unsolvedCaptcha.items[0].hash || '',
                    unsolvedCaptcha.items[2].hash || '',
                    unsolvedCaptcha.items[3].hash || '',
                ]
                const captchaSolution: CaptchaSolution = { ...unsolvedCaptcha, solution, salt: 'blah' }
                const commitments: string[] = []
                // Store 10 commitments in the local db
                for (let count = 0; count < 10; count++) {
                    const commitmentId = hexHash(`test${count}`)
                    commitments.push(commitmentId)
                    await providerTasks.db.storeDappUserSolution(
                        [captchaSolution],
                        commitmentId,
                        'test',
                        accountAddress(dappAccount),
                        providerDetails.datasetId.toString()
                    )
                    const userSolutions = await providerTasks.db.getDappUserSolutionById(commitmentId)
                    expect(userSolutions).to.be.not.empty
                }

                // Try to get commitments that are ready to be batched
                const commitmentsFromDbBeforeProcessing = await batcher.getCommitments()

                // Check the commitments are not returned from the db as they are not yet processed
                expect(commitmentsFromDbBeforeProcessing).to.be.empty

                // Mark the commitments as processed
                await providerTasks.db.flagUsedDappUserCommitments(commitments)
                await providerTasks.db.flagUsedDappUserSolutions(commitments)

                // Check the commitments are returned from the db as they are now processed
                const commitmentsFromDbBeforeBatching = await batcher.getCommitments()
                expect(commitmentsFromDbBeforeBatching.length).to.be.equal(10)

                // Commit the commitments to the contract
                await batcher.runBatch()

                // Try to get the solutions from the db
                const solutionsFromDbAfter = await env.db.getProcessedDappUserSolutions()

                // Check the solutions are no longer in the db
                expect(solutionsFromDbAfter).to.be.empty

                // Try to get the commitments from the db
                const commitmentsFromDbAfter = await env.db.getProcessedDappUserCommitments()

                // Check the solutions are no longer in the db
                expect(commitmentsFromDbAfter).to.be.empty

                // Check the commitments are in the contract
                for (const commitment of commitmentsFromDbBeforeBatching) {
                    const contractCommitment = await contractApi.getCaptchaSolutionCommitment(commitment.commitmentId)
                    expect(contractCommitment).to.be.not.empty
                }
                // Check the last batch commitment time
                const lastBatchCommit = await providerTasks.db.getLastScheduledTask(ScheduledTaskNames.BatchCommitment)
                expect(lastBatchCommit).to.be.not.empty

                // Expect the last batch commitment time to be within the last 10 seconds
                if (lastBatchCommit !== undefined) {
                    expect(+Date.now() - +lastBatchCommit?.datetime).to.be.lessThan(10000)
                }
            }
        }
    })
})