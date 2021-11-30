import {expect} from "chai";
import {hashDataSet} from '../src/captcha'
import {Captcha} from "../src/types/captcha";
const {blake2AsHex} = require('@polkadot/util-crypto');

const captchaData = [
    {
        "captchaId": "1",
        "salt": "0x01",
        "format": {
            "solution": [],
            "images": [
                {"path": "/home/chris/dev/prosopo/data/img/01.01.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.02.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.03.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.04.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.05.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.06.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.07.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.08.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.09.jpeg"}
            ],
            "target": "bus"
        },
    },
    {
        "captchaId": "2",
        "salt": "0x01",
        "format": {
            "solution": [],
            "images": [
                {"path": "/home/chris/dev/prosopo/data/img/01.01.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.02.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.03.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.04.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.05.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.06.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.07.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.08.jpeg"},
                {"path": "/home/chris/dev/prosopo/data/img/01.09.jpeg"}
            ],
            "target": "train"
        },
    } ,
];

describe("PROVIDER", () => {
    after(() => {
        return
    });

    it("Captcha data set is hashed correctly", async () => {
        console.log(captchaData);
        const dataSetHash =
            hashDataSet(captchaData as Captcha[]);
        expect(dataSetHash).equal("0x086e609ea356ca8395f6fd537f8f5dc6a3360278149a795a234246266e838222");
    })

})