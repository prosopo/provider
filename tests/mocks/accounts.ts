export const PROVIDER = {
    serviceOrigin: "http://localhost:8282",
    fee: 10,
    payee: "Provider",
    stake: 10,
    datasetFile: '/usr/src/data/captchas.json',
    datasetHash: undefined
}

export const DAPP = {
    serviceOrigin: "http://localhost:9393",
    mnemonic: "//Ferdie",
    contractAccount: process.env.DAPP_CONTRACT_ADDRESS,
    optionalOwner: "5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL", //Ferdie's address
    fundAmount: 100
}

export const DAPP_USER = {
    mnemonic: "//Charlie",
}
