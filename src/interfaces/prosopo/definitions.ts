export default {
    types: {
        GovernanceStatus: {
            _enum: [
                'Active',
                'Suspended',
                'Deactivated'
            ]
        },
        CaptchaStatus: {
            _enum: [
                'Pending',
                'Approved',
                'Disapproved'
            ]
        },
        DappAccounts: 'Vec<AccountId>',
        Dapp: {
        // eslint-disable-next-line sort-keys
            status: 'GovernanceStatus',
            balance: 'Balance',
            owner: 'AccountId',
            min_difficulty: 'u16',
            client_origin: 'Hash'
        },
        Error: {
            _enum: [
                'NotAuthorised',
                'InsufficientBalance',
                'InsufficientAllowance',
                'ProviderExists',
                'ProviderDoesNotExist',
                'ProviderInsufficientFunds',
                'ProviderInactive',
                'ProviderServiceOriginUsed',
                'DuplicateCaptchaDataId',
                'DappExists',
                'DappDoesNotExist',
                'DappInactive',
                'DappInsufficientFunds',
                'CaptchaDataDoesNotExist',
                'CaptchaSolutionCommitmentDoesNotExist',
                'DappUserDoesNotExist']
        },
        Payee: {
            _enum: [
                'Provider',
                'Dapp',
                'None'
            ]
        },
        User: {
            correct_captchas: 'u64',
            incorrect_captchas: 'u64'
        },
        ProviderAccounts: 'Vec<AccountId>',
        Provider: {
            status: 'GovernanceStatus',
            balance: 'Balance',
            fee: 'u32',
            payee: 'Payee',
            service_origin: 'Hash',
            captcha_dataset_id: 'Hash'
        },
        RandomProvider: {
            provider: 'Provider',
            block_number: 'u32',
        },
        ProviderMap: '{"AccountId":"Provider"}',
        CaptchaData: {
            provider: 'AccountId',
            merkle_tree_root: 'Hash',
            captcha_type: 'u16'
        },
        CaptchaSolutionCommitment: {
            account: 'AccountId',
            captcha_dataset_id: 'Hash',
            status: 'CaptchaStatus',
            contract: 'AccountId',
            provider: 'AccountId'
        }
    }
}