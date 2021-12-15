#!/usr/bin/env node
import {Tasks} from "../src/tasks/tasks";

require('dotenv').config()
import {Environment} from '../src/env'
import {prosopoContractApi} from "../src/contract";
import {ProviderStatus} from "../src/types/provider";

async function main() {
    const env = new Environment("//Alice");
    await env.isReady();
    //let contractApi = new prosopoContractApi(env);
    const tasks = new Tasks(env);
    await tasks.providerAccounts("", "Active" as ProviderStatus)
    await tasks.dappAccounts("", "Active" as ProviderStatus)
    process.exit();

}

main()
    .catch((error) => {
        console.error(error);
        process.exit();
    });
