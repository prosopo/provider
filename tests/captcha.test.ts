import {expect} from "chai";
import {hashDataset} from '../src/captcha'
import {Captcha} from "../src/types/captcha";

const {u8aToHex} = require('@polkadot/util');


const captchaData = [
    {
        "captchaId": 1,
        "solution": [],
        "salt": "0x01",
        "target": "bus",
        "items": [
            "/home/chris/dev/prosopo/data/img/01.01.jpeg",
            "/home/chris/dev/prosopo/data/img/01.02.jpeg",
            "/home/chris/dev/prosopo/data/img/01.03.jpeg",
            "/home/chris/dev/prosopo/data/img/01.04.jpeg",
            "/home/chris/dev/prosopo/data/img/01.05.jpeg",
            "/home/chris/dev/prosopo/data/img/01.06.jpeg",
            "/home/chris/dev/prosopo/data/img/01.07.jpeg",
            "/home/chris/dev/prosopo/data/img/01.08.jpeg",
            "/home/chris/dev/prosopo/data/img/01.09.jpeg"
        ]
    },
    {
        "captchaId": 2,
        "solution": [],
        "salt": "0x01",
        "target": "train",
        "items": [
            "/home/chris/dev/prosopo/data/img/01.01.jpeg",
            "/home/chris/dev/prosopo/data/img/01.02.jpeg",
            "/home/chris/dev/prosopo/data/img/01.03.jpeg",
            "/home/chris/dev/prosopo/data/img/01.04.jpeg",
            "/home/chris/dev/prosopo/data/img/01.05.jpeg",
            "/home/chris/dev/prosopo/data/img/01.06.jpeg",
            "/home/chris/dev/prosopo/data/img/01.07.jpeg",
            "/home/chris/dev/prosopo/data/img/01.08.jpeg",
            "/home/chris/dev/prosopo/data/img/01.09.jpeg"
        ]
    }
];


describe("PROVIDER", () => {
    after(() => {
        return
    });

    it("Captcha data set is hashed correctly", async () => {
        const datasetHash =
            hashDataset(captchaData as Captcha[]);
        //todo manually check this is the correct value
        expect(u8aToHex(datasetHash)).equal("0x9ee6dfb61a2fb903df487c401663825643bb825d41695e63df8af6162ab145a6");
    })

})