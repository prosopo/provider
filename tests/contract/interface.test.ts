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

    it('Gets the storage key from the ABI', async () => {
        const accounts = await contractApi.getStorageKey('provider_accounts')
        expect(accounts).to.equal('0x0100000000000000000000000000000000000000000000000000000000000000')
    })
})
