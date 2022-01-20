import {Collection} from "mongodb";
import {Captcha, CaptchaSolution, Dataset} from "./captcha";
import {Hash} from "@polkadot/types/interfaces";
import {CaptchaSolutionResponse} from "./api";

export interface Database {
    readonly url: string;
    tables: Tables
    dbname: string;

    connect(): Promise<void>;

    loadDataset(dataset: Dataset): Promise<void>;

    getRandomCaptcha(solved: boolean, datasetId: Hash | string | Uint8Array, size?: number): Promise<Captcha[] | undefined>;

    getCaptchaById(captchaId: string[]): Promise<Captcha[] | undefined>;

    updateCaptcha(captcha: Captcha, datasetId: string): Promise<void>;

    getDatasetDetails(datasetId: Hash | string | Uint8Array);

    storeDappUserCaptchaSolution(captchas: CaptchaSolution[],treeRoot: string);

    storeCaptchaSolutionResponse(captchaSolutionResponse: CaptchaSolutionResponse[], commitmentId: string)

    getCaptchaSolutionResponse(commitmentId: string): Promise<CaptchaSolutionResponse[]>
}

// Other table types from other database engines go here
export type Table = Collection | undefined

export interface Tables {
    [key: string]: Table
}