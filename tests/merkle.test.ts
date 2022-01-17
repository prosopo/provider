import {CaptchaMerkleTree} from "../src/merkle";
import {expect} from "chai";
import {hexHash} from "../src/util";
import {CaptchaSolution, CaptchaTypes, Dataset} from "../src/types/captcha";
import {computeCaptchaHashes} from "../src/captcha";

describe("PROVIDER MERKLE TREE", () => {
    after(() => {
        return
    });

    let DATASET: Dataset = {
        datasetId: "0x01",
        captchas: [
            {
                salt: "0x01020304",
                items: [
                    {type: "text", text: "1"},
                    {type: "text", text: "b"},
                    {type: "text", text: "c"}
                ], target: "letters", solution: [1, 2]
            },
            {
                salt: "0x02020304",
                items: [
                    {type: "text", text: "c"},
                    {type: "text", text: "e"},
                    {type: "text", text: "3"}
                ], target: "letters"
            },
            {
                salt: "0x03020304",
                items: [
                    {type: "text", text: "h"},
                    {type: "text", text: "f"},
                    {type: "text", text: "5"}
                ], target: "letters", solution: [2]
            }

        ],
        format: CaptchaTypes.SelectAll
    }

    let CAPTCHAS_WITH_LEAF_HASHES: CaptchaSolution[] = [
        {
            captchaId: "1",
            salt: "0x01020304",
            solution: [1, 2]
        },
        {
            captchaId: "2",
            salt: "0x02020304",
            solution: [3]
        },
        {
            captchaId: "3",
            salt: "0x03020304",
            solution: [2]
        }

    ]


    it("Tree contains correct leaf hashes when computing leaf hashes", async () => {
            let dataset = DATASET;
            const tree = new CaptchaMerkleTree()
            const captchasWithHashes = await computeCaptchaHashes(dataset['captchas']);
            await tree.build(captchasWithHashes);
            const leafHashes = tree.leaves.map(leaf => leaf.hash);
            expect(leafHashes).to.deep.equal([
                    "0x0712abea4b4307c161ea64227ae1f9400f6844287ec4d574b9facfddbf5f542a",
                    "0x9ce0e95f8a9095c2c336015255d67248ad3344f9d07d95147ca8d661a678ba3f",
                    "0xe08fd047f9591da52974567f36c9c91003e302cb39b6313aeac636142c0d4dce"
                ]
            )
        }
    )
    it("Tree root is correct when computing leaf hashes", async () => {
            let dataset = DATASET;
            const tree = new CaptchaMerkleTree()
            const captchasWithHashes = await computeCaptchaHashes(dataset['captchas']);
            await tree.build(captchasWithHashes);
            expect(tree.root!.hash).to.equal("0x37c909d29a8f41d53142f4acb317bb9496719825073fb452768a64878f6724f8");
        }
    )
    it("Tree proof works when computing leaf hashes", async () => {
            let dataset = DATASET;
            const tree = new CaptchaMerkleTree()
            const captchasWithHashes = await computeCaptchaHashes(dataset['captchas']);
            await tree.build(captchasWithHashes);
            const proof = tree.proof("0x0712abea4b4307c161ea64227ae1f9400f6844287ec4d574b9facfddbf5f542a");
            const layerZeroHash = hexHash(proof[0].join());
            expect(tree.layers[1].indexOf(layerZeroHash) > -1);
            const layerOneHash = hexHash(proof[1].join());
            expect(tree.layers[2].indexOf(layerOneHash) > -1);
        }
    )
    it("Tree contains correct leaf hashes when not computing leaf hashes", async () => {
            let captchas = CAPTCHAS_WITH_LEAF_HASHES;
            const tree = new CaptchaMerkleTree()
            await tree.build(captchas);

            const leafHashes = tree.leaves.map(leaf => leaf.hash);
            expect(leafHashes).to.deep.equal([
                    "1",
                    "2",
                    "3"
                ]
            )
        }
    )
    it("Tree root is correct when not computing leaf hashes", async () => {
            let captchas = CAPTCHAS_WITH_LEAF_HASHES;
            const tree = new CaptchaMerkleTree()
            await tree.build(captchas);
            expect(tree.root!.hash).to.equal("0x940abe0b0c80705b3a2563f171adf819a946a4d1b353755afc44e6c5a4224a8a");
        }
    )
    it("Tree proof works when not computing leaf hashes", async () => {
            let captchas = CAPTCHAS_WITH_LEAF_HASHES;
            const tree = new CaptchaMerkleTree()
            await tree.build(captchas);
            const proof = tree.proof("1");
            const layerZeroHash = hexHash(proof[0].join());
            expect(tree.layers[1].indexOf(layerZeroHash) > -1);
            const layerOneHash = hexHash(proof[1].join());
            expect(tree.layers[2].indexOf(layerOneHash) > -1);
        }
    )

    it.only("Tree proof works when there is only one leaf", async () => {
            let captchas = [CAPTCHAS_WITH_LEAF_HASHES[0]];
            const tree = new CaptchaMerkleTree()
            console.log(captchas);
            await tree.build(captchas);
            const proof = tree.proof("1");
            console.log(tree);
            console.log(tree.layers);
            const layerZeroHash = hexHash(proof[0].join());
            expect(tree.layers[1].indexOf(layerZeroHash) > -1);
            const layerOneHash = hexHash(proof[1].join());
            expect(tree.layers[2].indexOf(layerOneHash) > -1);
        }
    )

})