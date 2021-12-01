import {Environment} from "../env";

const contractDefinitions = {
    Status: {
        _enum: [
            'Active',
            'Suspended',
            'Deactivated',
            'Pending',
            'Approved',
            'Disapproved'
        ]
    },
    Dapp: {
        // eslint-disable-next-line sort-keys
        status: 'Status',
        balance: 'Balance',
        owner: 'AccountId',
        min_difficulty: 'u16',
        client_origin: 'Hash',
    },
    CaptchaProvider: {
        // eslint-disable-next-line sort-keys
        status: 'Status',
        staked: 'Balance',
        fee: 'u32',
        service_origin: 'Hash',
        captcha_data_id: 'u64',
    },
    ProsopoError: {
        _enum: [
            'NotAuthorised',
            'InsufficientBalance',
            'InsufficientAllowance',
            'CaptchaProviderExists',
            'CaptchaProviderDoesNotExist',
            'CaptchaProviderInsufficientFunds',
            'CaptchaProviderInactive',
            'DuplicateCaptchaDataId',
            'DappExists',
            'DappDoesNotExist',
            'DappInactive',
            'DappInsufficientFunds',
            'CaptchaDataDoesNotExist',
            'CaptchaSolutionCommitmentDoesNotExist',
            'DappUserDoesNotExist',]
    },
    Payee: {
        _enum: [
            'Provider',
            'Dapp',
            'None',
        ]
    },
    User: {
        correct_captchas: 'u64',
        incorrect_captchas: 'u64',
    }

}

export interface contractApiInterface {
    env: Environment

    providerRegister(providerServiceOrigin: string, providerFee: number, payee: string, address: string): Promise<Object>

    providerUpdate(providerServiceOrigin: string, providerFee: number, payee: string, address: string): Promise<Object>

    providerDeregister(address: string): Promise<Object>

    providerStake(value: number): Promise<Object>

    providerUnstake(value: number): Promise<Object>

    providerAddDataset(datasetHash: Uint8Array): Promise<Object>

    dappRegister(dappServiceOrigin: string, dappContractAddress: string, dappOwner?: string | undefined): Promise<Object>
}

export default contractDefinitions;