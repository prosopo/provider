import {expect} from "chai";
import {Captcha} from "../src/types/captcha";

const captchaData = [
    {
        "solution": [],
        "salt": "0x01",
        "target": "bus",
        "items": [
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},

        ]
    },
    {
        "salt": "0x02",
        "target": "train",
        "items": [
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
            {"type": "text", "text": "blah"},
        ]
    }
];


describe("PROVIDER", () => {
    after(() => {
        return
    });

    // it("Captcha data set is hashed correctly", async () => {
    //     const captchas = await addHashesToCaptchas(captchaData as Captcha[]);
    //     expect(captchas[0]['captchaId']).equal("0x361faabdd0dcf4d3d2b95d439307bd3ae100c26cffa3043a39f40248e989a98c");
    //     expect(captchas[1]['captchaId']).equal("0x8b68a08350fd3caecd03b5813274c37ac64d3b224157db359340ed323a4f8da9");
    // });
    //
    // it("Empty captchas returns empty", async () => {
    //     expect(await addHashesToCaptchas([])).is.empty;
    // })

})