import { MockEnvironment } from '../mocks/mockenv'
import { ProsopoContractApi } from '../../src/contract/interface'

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
chai.should()
chai.use(chaiAsPromised)
const expect = chai.expect

describe('CONTRACT WRAPPER', () => {
    let contractApi

    before(async () => {
        // Register the dapp
        const mockEnv = new MockEnvironment()
        await mockEnv.isReady()
        await mockEnv.changeSigner('//Alice')
        contractApi = new ProsopoContractApi(mockEnv)
    })

    it('Unwrap function properly unwraps JSON', () => {
        const data = { Ok: { some: { other: 'data' } } }
        expect(contractApi.unwrap(data)).to.deep.equal({ some: { other: 'data' } })
    })

    it('Properly encodes `Hash` arguments when passed unhashed', () => {
        const args = ['https://localhost:8282']
        const methodObj = { args: [{ type: { type: 'Hash' } }] }
        expect(contractApi.encodeStringArgs(methodObj, args)).to.deep.equal([
            new Uint8Array([
                9, 253, 81, 160, 217, 224, 208, 123,
                233, 170, 171, 6, 67, 225, 21, 44,
                34, 205, 17, 217, 209, 40, 35, 85,
                82, 212, 118, 37, 107, 115, 81, 222
            ])
        ])
    })

    it('Gets the contract method from the ABI when method name is valid', () => {
        expect(function () {
            contractApi.getContractMethod('dappRegister')
        }).to.not.throw()
    })

    it('Throws an error when method name is invalid', () => {
        expect(function () {
            contractApi.getContractMethod('methodThatDoesntExist')
        }).to.throw(/Invalid contract method/)
    })

    // it('Gets the storage key from the ABI', () => {
    //     contractApi.getStorageKey(storageName)
    // })
})
