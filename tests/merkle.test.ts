// Copyright 2021-2022 Prosopo (UK) Ltd.
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
import {
    CaptchaItemTypes,
    CaptchaMerkleTree,
    CaptchaTypes,
    Dataset,
    RawSolution,
    calculateItemHashes,
    computeCaptchaHash,
    hexHashArray,
    matchItemsToSolutions,
} from '@prosopo/datasets'
import { expect } from 'chai'

const DATASET: Dataset = {
    datasetId: '0x01',
    captchas: [
        {
            salt: '0x01020304',
            items: calculateItemHashes([
                { type: CaptchaItemTypes.Text, data: '1' },
                { type: CaptchaItemTypes.Text, data: 'b' },
                { type: CaptchaItemTypes.Text, data: 'c' },
            ]),
            target: 'letters',
            solution: [0] as RawSolution[],
        },
        {
            salt: '0x02020304',
            items: calculateItemHashes([
                { type: CaptchaItemTypes.Text, data: 'c' },
                { type: CaptchaItemTypes.Text, data: 'e' },
                { type: CaptchaItemTypes.Text, data: '3' },
            ]),
            target: 'letters',
        },
        {
            salt: '0x03020304',
            items: calculateItemHashes([
                { type: CaptchaItemTypes.Text, data: 'h' },
                { type: CaptchaItemTypes.Text, data: 'f' },
                { type: CaptchaItemTypes.Text, data: '5' },
            ]),
            target: 'letters',
            solution: [1] as RawSolution[],
        },
    ],
    format: CaptchaTypes.SelectAll,
}

describe('PROVIDER MERKLE TREE', () => {
    before(() => {
        DATASET.captchas[0].solution = matchItemsToSolutions([1, 2], DATASET.captchas[0].items)
        DATASET.captchas[1].solution = matchItemsToSolutions([2], DATASET.captchas[1].items)
    })

    it('Tree contains correct leaf hashes when computing leaf hashes', () => {
        const dataset = DATASET
        const tree = new CaptchaMerkleTree()
        const captchaHashes = dataset.captchas.map((captcha) => computeCaptchaHash(captcha, false, false, false))

        tree.build(captchaHashes)
        const leafHashes = tree.leaves.map((leaf) => leaf.hash)
        expect(leafHashes).to.deep.equal([
            '0xa0957907fd7c36747f92d31753d295c2affa6c6b04f5e84e1228f40568ddda0c',
            '0xbefa0a7c4eb127459e01561e0a4d87108581fc8f6c75128ceafa8f6c2c036fa4',
            '0xfd248874ff5b5606fbad7f2327a31e7ca8833f9f4c8f9afedc3b6483d9866abc',
        ])
    })
    it('Tree root is correct when computing leaf hashes', () => {
        const dataset = DATASET
        const tree = new CaptchaMerkleTree()
        const captchaHashes = dataset.captchas.map((captcha) => computeCaptchaHash(captcha, false, false, false))

        tree.build(captchaHashes)
        expect(tree.root!.hash).to.equal('0x460059c537d10c5b41964968e4158a9a14fcb63ea1d75591eab4222b845a9d36')
    })
    it('Tree proof works when computing leaf hashes', () => {
        const dataset = DATASET
        const tree = new CaptchaMerkleTree()
        const captchaHashes = dataset.captchas.map((captcha) => computeCaptchaHash(captcha, false, false, false))

        tree.build(captchaHashes)
        const proof = tree.proof('0x0712abea4b4307c161ea64227ae1f9400f6844287ec4d574b9facfddbf5f542a')
        const layerZeroHash = hexHashArray(proof[0])

        expect(tree.layers[1].indexOf(layerZeroHash) > -1)
        const layerOneHash = hexHashArray(proof[1])

        expect(tree.layers[2].indexOf(layerOneHash) > -1)
    })
    it('Tree contains correct leaf hashes when not computing leaf hashes', () => {
        const tree = new CaptchaMerkleTree()

        tree.build(['1', '2', '3'])
        const leafHashes = tree.leaves.map((leaf) => leaf.hash)

        expect(leafHashes).to.deep.equal(['1', '2', '3'])
    })
    it('Tree root is correct when not computing leaf hashes', () => {
        const tree = new CaptchaMerkleTree()

        tree.build(['1', '2', '3'])
        expect(tree.root!.hash).to.equal('0x8fd940838c54e2406976e8c4745f39457fe27c7555a21a572b665efcc5d27bd6')
    })
    it('Tree proof works when not computing leaf hashes', () => {
        const tree = new CaptchaMerkleTree()

        tree.build(['1', '2', '3'])
        const proof = tree.proof('1')
        const layerZeroHash = hexHashArray(proof[0])

        expect(tree.layers[1].indexOf(layerZeroHash) > -1)
        const layerOneHash = hexHashArray(proof[1])

        expect(tree.layers[2].indexOf(layerOneHash) > -1)
    })

    it('Tree proof works when there is only one leaf', () => {
        const tree = new CaptchaMerkleTree()

        tree.build(['1'])
        const proof = tree.proof('1')

        expect(proof).to.deep.equal([['1']])
    })
})
