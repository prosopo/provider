import {Environment} from '../src/env'
import yargs from 'yargs'
import {CaptchaMerkleTree} from "../src/merkle";
import {Tasks} from "../src/tasks/tasks";

require('dotenv').config()

const PROVIDER = {
    serviceOrigin: "http://localhost:8282",
    fee: 10,
    payee: "Provider",
    stake: 10,
    datasetFile: '/usr/src/data/captchas.json',
    datasetHash: ""
}

const DAPP = {
    serviceOrigin: "http://localhost:9393",
    mnemonic: "//Ferdie",
    contractAccount: "",
    optionalOwner: "",
    fundAmount: 100
}

const DAPP_USER = {
    mnemonic: "//Charlie",
}


async function run() {
    const env = new Environment("//Alice");
    await env.isReady();

    if (process.env.PROVIDER_MNEMONIC) {
        await processArgs(env);
    }

    process.exit();
}

function processArgs(env) {
    console.log("here")
    return yargs
        .usage('Usage: $0 [global options] <command> [options]')
        .command('provider', 'Setup a Provider', (yargs) => {
                return yargs
            }, async (argv) => {
                // @ts-ignore
                const providerKeyringPair = env.network.keyring.addFromMnemonic(process.env.PROVIDER_MNEMONIC.toString());
                await sendFunds(env, providerKeyringPair.address, 'Provider', 1e15);
                await setupProvider(env, providerKeyringPair.address)
            },
        )
        .command('dapp', 'Setup a Dapp', (yargs) => {
                return yargs
            }, async (argv) => {
                await setupDapp(env);
            },
        )
        .command('user', 'Submit and approve Dapp User solution commitments', (yargs) => {
                return yargs
            }, async (argv) => {
                await setupDappUser(env);
            },
        )
        .argv
}

async function displayBalance(env, address, who) {
    const balance = await env.network.api.query.system.account(address);
    console.log(who, " Balance: ", balance.data.free.toHuman())
    return balance
}

async function sendFunds(env, address, who, amount) {
    let balance = await displayBalance(env, address, who);
    const signerAddresses = await env.network.getAddresses();
    // @ts-ignore
    const Alice = signerAddresses[0];
    let api = env.network.api;
    if (balance.data.free.toNumber() === 0) {
        const alicePair = env.network.keyring.getPair(Alice);
        await env.patract.buildTx(
            api.registry,
            api.tx.balances.transfer(address, amount),
            alicePair.address // from
        );
        await displayBalance(env, address, who);
    }
}

async function setupProvider(env, address) {
    console.log("Setup Provider\n---------------")
    await env.changeSigner(process.env.PROVIDER_MNEMONIC);
    const tasks = new Tasks(env);
    console.log(" - providerRegister")
    await tasks.providerRegister(PROVIDER.serviceOrigin, PROVIDER.fee, PROVIDER.payee, address);
    console.log(" - providerStake")
    await tasks.providerStake(PROVIDER.stake);
    console.log(" - providerAddDataset")
    const datasetResult = await tasks.providerAddDataset(PROVIDER.datasetFile);
    PROVIDER.datasetHash = datasetResult[0]['args'][1];
}

async function setupDapp(env) {
    console.log("setupDapp\n---------------")
    const tasks = new Tasks(env);
    await env.changeSigner(DAPP.mnemonic);
    console.log(" - dappRegister")
    await tasks.dappRegister(DAPP.serviceOrigin, DAPP.contractAccount, DAPP.optionalOwner)
    console.log(" - dappFund")
    await tasks.dappFund(DAPP.contractAccount, DAPP.fundAmount);
}

async function setupDappUser(env) {
    console.log("setupDappUser\n---------------")
    await env.changeSigner(DAPP_USER.mnemonic);

    // This next section is doing everything that the ProCaptcha repo will eventually be doing in the client browser
    //   1. Get captcha JSON
    //   2. Add solution
    //   3. Send clear solution to Provider
    //   4. Send merkle tree solution to Blockchain
    const tasks = new Tasks(env);
    console.log(" - getCaptchaWithProof")
    const provider = await tasks.getProviderDetails(process.env.PROVIDER_ADDRESS!);
    console.log(provider);
    process.exit();
    const solved = await tasks.getCaptchaWithProof(PROVIDER.datasetHash, true, 1)
    const unsolved = await tasks.getCaptchaWithProof(PROVIDER.datasetHash, false, 1)
    solved[0].captcha.solution = [1];
    unsolved[0].captcha.solution = [1];
    //TODO add salt to solution
    console.log(" - build Merkle tree")
    let tree = new CaptchaMerkleTree();
    await tree.build([solved[0].captcha, unsolved[0].captcha]);
    // TODO send solution to Provider database
    await env.changeSigner(DAPP_USER.mnemonic);
    console.log(" - dappUserCommit")
    await tasks.dappUserCommit(DAPP.contractAccount, PROVIDER.datasetHash, tree.root!.hash);
}

run().catch((err) => {
    throw new Error(`Setup dev error: ${err}`);
});