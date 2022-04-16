declare const _default: {
    captchas: {
        solved: {
            count: number;
        };
        unsolved: {
            count: number;
        };
    };
    logLevel: string;
    contract: {
        abi: string;
    };
    defaultEnvironment: string;
    networks: {
        development: {
            endpoint: string;
            contract: {
                address: string;
                deployer: {
                    address: string;
                };
                name: string;
            };
            accounts: string[];
        };
    };
    captchaSolutions: {
        requiredNumberOfSolutions: number;
        solutionWinningPercentage: number;
        captchaFilePath: string;
    };
    database: {
        development: {
            endpoint: string;
            type: string;
            dbname: string;
        };
    };
};
export default _default;
